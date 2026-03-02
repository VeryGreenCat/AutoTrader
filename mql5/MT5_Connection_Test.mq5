#property copyright "Copyright 2024, AutoTrader"
#property link      "https://www.mql5.com"
#property version   "1.00"
#property strict

input string Token     = "PASTE_YOUR_TOKEN_HERE";
input string ServerURL = "http://127.0.0.1:5000/api";
input int    PushEvery = 60; // seconds

//+------------------------------------------------------------------+
//| Send a POST request to the given endpoint with a JSON body       |
//+------------------------------------------------------------------+
int PostToServer(string endpoint, string json_payload) {
    char post[], result[];
    string headers = "Content-Type: application/json\r\n";

    StringToCharArray(json_payload, post, 0, StringLen(json_payload), CP_UTF8);

    int res = WebRequest("POST", ServerURL + endpoint, headers, 5000, post, result, headers);

    if (res == -1) {
        int err = GetLastError();
        Print("WebRequest failed. Error: ", err);
        if (err == 4060)
            Print("Add ", ServerURL, " to MT5 Options → Expert Advisors → Allow WebRequest");
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
    string headers;

    int res = WebRequest("GET", ServerURL + endpoint + "?token=" + Token, "", 5000, post, result, headers);

    if (res == -1) {
        Print("GET failed. Error: ", GetLastError());
        return "";
    }

    return CharArrayToString(result, 0, WHOLE_ARRAY, CP_UTF8);
}

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

    string json = StringFormat(
        "{\"token\":\"%s\",\"mt5_id\":\"%I64d\",\"balance\":%.2f,\"equity\":%.2f,\"realized_today\":%.2f,\"realized_week\":%.2f}",
        Token, mt5_id, balance, equity, realizedToday, realizedWeek
    );
    PostToServer("/metatrader/push", json);

}

//+------------------------------------------------------------------+
//| Ask backend if there's a pending trade signal                    |
//+------------------------------------------------------------------+
void FetchSignals() {
    string response = GetFromServer("/metatrader/signal");
    if (response == "") return;

    // TODO: parse response and execute trade
    Print("Fetched Signal received: ", response);
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
    Print("Connecting to AutoTrader's Server...");
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