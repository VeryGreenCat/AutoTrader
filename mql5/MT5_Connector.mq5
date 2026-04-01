#property copyright "Copyright 2024, AutoTrader"
#property link      "https://www.mql5.com"
#property version   "1.00"
#property strict

input string Token     = "PASTE_YOUR_TOKEN_HERE"; // Your AutoTrader Access Token
input string ServerURL = "http://127.0.0.1:5000"; // Backend API URL
input int    PushEvery = 60; // Update Data Every (Seconds)

string G_ServerURL = ""; // Global variable for processed URL

//+------------------------------------------------------------------+
//| Send a POST request to the given endpoint with a JSON body       |
//+------------------------------------------------------------------+
int PostToServer(string endpoint, string json_payload) {
    char post[], result[];
    string reqHeaders = "Content-Type: application/json\r\n"
                      + "Authorization: Bearer " + Token + "\r\n";
    string resultHeaders; // separate buffer — WebRequest writes response headers here

    StringToCharArray(json_payload, post, 0, StringLen(json_payload), CP_UTF8);

    int res = WebRequest("POST", G_ServerURL + endpoint, reqHeaders, 5000, post, result, resultHeaders);

    if (res == -1) {
        int err = GetLastError();
        Print("WebRequest failed. Error: ", err);
        if (err == 4060)
            Print("Add ", G_ServerURL, " to MT5 Options → Expert Advisors → Allow WebRequest");
        return -1;
    }

    string response = CharArrayToString(result, 0, WHOLE_ARRAY, CP_UTF8);
    Print("Response [", res, "]: ", response);
    return res;
}

//+------------------------------------------------------------------+
//| Send a GET request and return response body                      |
//+------------------------------------------------------------------+
string GetFromServer(string endpoint) {
    char post[], result[];
    string reqHeaders = "Authorization: Bearer " + Token + "\r\n";
    string resultHeaders; // separate buffer for response headers

    string separator = (StringFind(endpoint, "?") >= 0) ? "&" : "?";
    string url = G_ServerURL + endpoint + separator + "token=" + Token;

    int res = WebRequest("GET", url, reqHeaders, 5000, post, result, resultHeaders);

    if (res == -1) {
        Print("GET failed. Error: ", GetLastError());
        return "";
    }

    return CharArrayToString(result, 0, WHOLE_ARRAY, CP_UTF8);
}

#include <Trade\Trade.mqh>

CTrade ExtTrade;

//+------------------------------------------------------------------+
//| Push live account data to backend                                |
//+------------------------------------------------------------------+
void PushData() {
    long   mt5_id  = AccountInfoInteger(ACCOUNT_LOGIN);
    double balance = AccountInfoDouble(ACCOUNT_BALANCE);
    double equity  = AccountInfoDouble(ACCOUNT_EQUITY);

    // Today's realized P&L from closed deals
    datetime todayStart = StringToTime(TimeToString(TimeCurrent(), TIME_DATE));
    HistorySelect(todayStart, TimeCurrent());
    double realizedToday = 0;
    int totalDealsCount = HistoryDealsTotal();
    for (int i = 0; i < totalDealsCount; i++) {
        ulong ticket = HistoryDealGetTicket(i);
        if (HistoryDealGetInteger(ticket, DEAL_ENTRY) == DEAL_ENTRY_OUT) {
            realizedToday += HistoryDealGetDouble(ticket, DEAL_PROFIT);
            realizedToday += HistoryDealGetDouble(ticket, DEAL_SWAP);
            realizedToday += HistoryDealGetDouble(ticket, DEAL_COMMISSION);
        }
    }

    // Weekly realized P&L (Starting Monday)
    MqlDateTime dt;
    TimeToStruct(TimeCurrent(), dt);
    int daysToMonday = (dt.day_of_week == 0) ? 6 : (dt.day_of_week - 1);
    datetime weekStart = StringToTime(TimeToString(TimeCurrent() - daysToMonday * 86400, TIME_DATE));
    
    HistorySelect(weekStart, TimeCurrent());
    double realizedWeek = 0;
    int weekDealsCount = HistoryDealsTotal();
    for (int i = 0; i < weekDealsCount; i++) {
        ulong ticket = HistoryDealGetTicket(i);
        if (HistoryDealGetInteger(ticket, DEAL_ENTRY) == DEAL_ENTRY_OUT) {
            realizedWeek += HistoryDealGetDouble(ticket, DEAL_PROFIT);
            realizedWeek += HistoryDealGetDouble(ticket, DEAL_SWAP);
            realizedWeek += HistoryDealGetDouble(ticket, DEAL_COMMISSION);
        }
    }

    // Last 10 Closed Deals
    HistorySelect(0, TimeCurrent());
    string json_closed = "[";
    int count_closed = 0;
    int total_deals = HistoryDealsTotal();
    for (int i = total_deals - 1; i >= 0 && count_closed < 10; i--) {
        ulong tick = HistoryDealGetTicket(i);
        if (tick > 0 && HistoryDealGetInteger(tick, DEAL_ENTRY) == DEAL_ENTRY_OUT) {
            long ticket_id = HistoryDealGetInteger(tick, DEAL_POSITION_ID); // Use position ID as common link
            string pair = HistoryDealGetString(tick, DEAL_SYMBOL);
            string type = (HistoryDealGetInteger(tick, DEAL_TYPE) == DEAL_TYPE_BUY) ? "BUY" : "SELL";
            double entry = HistoryDealGetDouble(tick, DEAL_PRICE);
            double lot = HistoryDealGetDouble(tick, DEAL_VOLUME);
            double profit = HistoryDealGetDouble(tick, DEAL_PROFIT) + HistoryDealGetDouble(tick, DEAL_SWAP) + HistoryDealGetDouble(tick, DEAL_COMMISSION);

            if (count_closed > 0) json_closed += ",";
            json_closed += StringFormat(
                "{\"ticket\":%I64d,\"pair\":\"%s\",\"type\":\"%s\",\"entry\":%.5f,\"lot\":%.2f,\"profit\":%.2f}",
                ticket_id, pair, type, entry, lot, profit
            );
            count_closed++;
        }
    }
    json_closed += "]";

    // Last 10 Open Positions
    string json_open = "[";
    int count_open = 0;
    int total_open = PositionsTotal();
    for (int i = total_open - 1; i >= 0 && count_open < 10; i--) {
        ulong pkticket = PositionGetTicket(i);
        if (pkticket > 0) {
            long ticket_id = PositionGetInteger(POSITION_TICKET);
            string pair = PositionGetString(POSITION_SYMBOL);
            string type = (PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY) ? "BUY" : "SELL";
            double entry = PositionGetDouble(POSITION_PRICE_OPEN);
            double current = PositionGetDouble(POSITION_PRICE_CURRENT);
            double lot = PositionGetDouble(POSITION_VOLUME);
            double profit = PositionGetDouble(POSITION_PROFIT);

            if (count_open > 0) json_open += ",";
            json_open += StringFormat(
                "{\"ticket\":%I64d,\"pair\":\"%s\",\"type\":\"%s\",\"entry\":%.5f,\"current\":%.5f,\"lot\":%.2f,\"profit\":%.2f}",
                ticket_id, pair, type, entry, current, lot, profit
            );
            count_open++;
        }
    }
    json_open += "]";

    string json = StringFormat(
        "{\"token\":\"%s\",\"mt5_id\":\"%I64d\",\"balance\":%.2f,\"equity\":%.2f,\"realized_today\":%.2f,\"realized_week\":%.2f,\"open_positions\":%s,\"closed_positions\":%s}",
        Token, mt5_id, balance, equity, realizedToday, realizedWeek, json_open, json_closed
    );
    PostToServer("/metatrader/push", json);

}

//+------------------------------------------------------------------+
//| Close all positions for current symbol                           |
//+------------------------------------------------------------------+
void CloseAllPositions() {
    for (int i = PositionsTotal() - 1; i >= 0; i--) {
        if (PositionGetSymbol(i) == _Symbol) {
            ulong ticket = PositionGetTicket(i);
            ExtTrade.PositionClose(ticket);
        }
    }
}

//+------------------------------------------------------------------+
//| Close all positions for current symbol that are NOT of certain type |
//+------------------------------------------------------------------+
void CloseOppositePositions(ENUM_POSITION_TYPE typeToKeep) {
    for (int i = PositionsTotal() - 1; i >= 0; i--) {
        if (PositionGetSymbol(i) == _Symbol) {
            if (PositionGetInteger(POSITION_TYPE) != typeToKeep) {
                ulong ticket = PositionGetTicket(i);
                ExtTrade.PositionClose(ticket);
            }
        }
    }
}

//+------------------------------------------------------------------+
//| Ask backend if there's a pending trade signal                    |
//+------------------------------------------------------------------+
double GetJsonDouble(string json, string key) {
    string searchStr = "\"" + key + "\":";
    int pos = StringFind(json, searchStr);
    if (pos == -1) return 0.0;
    
    pos += StringLen(searchStr);
    int end1 = StringFind(json, ",", pos);
    int end2 = StringFind(json, "}", pos);
    
    int endPos = end1;
    if (end1 == -1) endPos = end2;
    else if (end2 != -1 && end2 < end1) endPos = end2;
    
    if (endPos == -1) return 0.0;
    
    string numStr = StringSubstr(json, pos, endPos - pos);
    StringTrimLeft(numStr);
    StringTrimRight(numStr);
    return StringToDouble(numStr);
}

double GetPipSize(string symbol) {
    double point = SymbolInfoDouble(symbol, SYMBOL_POINT);
    int digits = (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS);
    if (digits == 3 || digits == 5) return point * 10.0;
    return point;
}

void FetchSignals() {
    long mt5_id = AccountInfoInteger(ACCOUNT_LOGIN);
    string endpoint = StringFormat("/metatrader/signal?mt5_id=%I64d&symbol=%s", mt5_id, _Symbol);
    string response = GetFromServer(endpoint);
    if (response == "" || StringFind(response, "\"signal\":\"HOLD\"") >= 0) return;

    Print("Fetched Signal response: ", response);
    
    // Check if the signal contains the correct currency just in case (optional, since the backend handles it)
    
    if (StringFind(response, "\"signal\":\"BUY\"") >= 0) {
        Print("🚀 SIGNAL RECEIVED: BUY. Closing opposite and opening Long...");
        CloseOppositePositions(POSITION_TYPE_BUY);
        
        // Only open if we don't have a buy already for THIS symbol
        if (!PositionSelect(_Symbol) || PositionGetInteger(POSITION_TYPE) != POSITION_TYPE_BUY) {
            double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
            double pip = GetPipSize(_Symbol);
            double sl_pips = GetJsonDouble(response, "sl");
            double tp_pips = GetJsonDouble(response, "tp");
            
            double sl_price = 0;
            double tp_price = 0;
            if (sl_pips > 0) sl_price = NormalizeDouble(ask - sl_pips * pip, (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS));
            if (tp_pips > 0) tp_price = NormalizeDouble(ask + tp_pips * pip, (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS));
            
            PrintFormat("Executing BUY at %f | SL: %f (%.1f pips) | TP: %f (%.1f pips)", ask, sl_price, sl_pips, tp_price, tp_pips);
            if (ExtTrade.Buy(0.1, _Symbol, ask, sl_price, tp_price, "AutoTrader PPO Buy")) {
                ulong ticket = ExtTrade.ResultOrder();
                PrintFormat("✅ BUY executed successfully! Transaction ID: %I64d | Currency: %s", ticket, _Symbol);
            } else {
                Print("❌ BUY execution failed. Error: ", GetLastError());
            }
        }
    } 
    else if (StringFind(response, "\"signal\":\"SELL\"") >= 0) {
        Print("🚀 SIGNAL RECEIVED: SELL. Closing opposite and opening Short...");
        CloseOppositePositions(POSITION_TYPE_SELL);
        
        // Only open if we don't have a sell already for THIS symbol
        if (!PositionSelect(_Symbol) || PositionGetInteger(POSITION_TYPE) != POSITION_TYPE_SELL) {
            double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
            double pip = GetPipSize(_Symbol);
            double sl_pips = GetJsonDouble(response, "sl");
            double tp_pips = GetJsonDouble(response, "tp");
            
            double sl_price = 0;
            double tp_price = 0;
            if (sl_pips > 0) sl_price = NormalizeDouble(bid + sl_pips * pip, (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS));
            if (tp_pips > 0) tp_price = NormalizeDouble(bid - tp_pips * pip, (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS));
            
            PrintFormat("Executing SELL at %f | SL: %f (%.1f pips) | TP: %f (%.1f pips)", bid, sl_price, sl_pips, tp_price, tp_pips);
            if (ExtTrade.Sell(0.1, _Symbol, bid, sl_price, tp_price, "AutoTrader PPO Sell")) {
                ulong ticket = ExtTrade.ResultOrder();
                PrintFormat("✅ SELL executed successfully! Transaction ID: %I64d | Currency: %s", ticket, _Symbol);
            } else {
                Print("❌ SELL execution failed. Error: ", GetLastError());
            }
        }
    }
    else if (StringFind(response, "\"signal\":\"CLOSE\"") >= 0) {
        Print("🚀 SIGNAL RECEIVED: CLOSE. Closing all to stay neutral...");
        CloseAllPositions();
    }
}
//+------------------------------------------------------------------+
//| Function                                                         |
//+------------------------------------------------------------------+
void ConnectToServer() {
    long mt5_id = AccountInfoInteger(ACCOUNT_LOGIN);
    string json = StringFormat("{\"mt5_id\":\"%I64d\",\"token\":\"%s\"}", mt5_id, Token);
    int res = PostToServer("/metatrader/connect", json);
    
    if (res == 200 || res == 201) {
        Print("✅ Connected to AutoTrader server successfully.");
        PushData();
        FetchSignals();
    } else {
        Print("❌ Failed to connect to AutoTrader server. Code: ", res);
    }
}

//+------------------------------------------------------------------+
int OnInit() { //runs once when the EA starts
    G_ServerURL = ServerURL;
    // Ensure trailing slash and /api suffix
    StringTrimRight(G_ServerURL);
    if (StringSubstr(G_ServerURL, StringLen(G_ServerURL) - 1, 1) == "/") 
        G_ServerURL = StringSubstr(G_ServerURL, 0, StringLen(G_ServerURL) - 1);
    
    if (StringFind(G_ServerURL, "/api") == -1)
        G_ServerURL += "/api";

    Print("--- AutoTrader EA Initializing ---");
    Print("Target Server: ", G_ServerURL);
    Print("Important: Ensure this URL is in MT5 -> Tools -> Options -> Expert Advisors -> Allow WebRequest");
    
    EventSetTimer(PushEvery);
    ConnectToServer();
    return INIT_SUCCEEDED;
}

void OnTimer() {
    PushData();
    FetchSignals();
}

void OnDeinit(const int reason) {
    EventKillTimer();
    Print("AutoTrader EA stopped.");
}

void OnTick() {}