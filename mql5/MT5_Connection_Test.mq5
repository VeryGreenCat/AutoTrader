//+------------------------------------------------------------------+
//|                                        MT5_Connection_Test.mq5   |
//|                                      Copyright 2024, AutoTrader  |
//|                                             https://www.mql5.com |
//+------------------------------------------------------------------+
#property copyright "Copyright 2024, AutoTrader"
#property link      "https://www.mql5.com"
#property version   "1.00"
#property strict

// Input parameters for the user to configure
input string   Token  = "PASTE_YOUR_TOKEN_HERE"; // Connection Token from Website
input string   ServerURL = "http://localhost:5000/api/metatrader/connect"; // Go Backend URL

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
  {
   Print("Initializing MT5 Connection Test EA...");

   // Get the MT5 Account ID (Login number)
   long mt5_id = AccountInfoInteger(ACCOUNT_LOGIN);
   
   // Format the JSON payload 
   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   double today_pnl = AccountInfoDouble(ACCOUNT_PROFIT); // Simplified profit
   
   string json_payload = StringFormat("{\"mt5_id\":\"%I64d\",\"token\":\"%s\",\"balance\":%.2f,\"equity\":%.2f,\"today_pnl\":%.2f}", mt5_id, Token, balance, equity, today_pnl);
   
   // Prepare WebRequest parameters
   char post[], result[];
   string headers = "Content-Type: application/json\r\n";
   int res;
   
   // Convert JSON string to char array for the body
   int str_len = StringLen(json_payload);
   StringToCharArray(json_payload, post, 0, str_len, CP_UTF8);
   
   // Send POST request to the Go backend
   Print("Sending connection test to: ", ServerURL);
   Print("Payload: ", json_payload);
   
   res = WebRequest("POST", ServerURL, headers, 5000, post, result, headers);
   
   if(res == -1)
     {
      int last_error = GetLastError();
      Print("Error in WebRequest. Error code =", last_error);
      
      if(last_error == 4060) // ERR_FUNCTION_NOT_ALLOWED
        {
         Print("IMPORTANT: You must enable 'Allow WebRequest for listed URL' and add 'http://localhost:5000' in MT5 Options -> Expert Advisors.");
         MessageBox("Please add 'http://localhost:5000' to the allowed WebRequest URLs in MT5 (Ctrl+O -> Expert Advisors).", "WebRequest Not Allowed", MB_ICONERROR);
        }
     }
   else
     {
      // Convert response char array to string
      string response = CharArrayToString(result, 0, WHOLE_ARRAY, CP_UTF8);
      Print("Server Response Code: ", res);
      Print("Server Response Body: ", response);
      
      if(res == 200 || res == 201)
        {
         Print("✅ Connection to AI Server Successful!");
        }
      else
        {
         Print("❌ Server returned error status.");
        }
     }
     
   return(INIT_SUCCEEDED);
  }

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
   Print("Connection Test EA Removed.");
  }

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
  {
   // We only need this to run once on init for testing connection
  }
//+------------------------------------------------------------------+
