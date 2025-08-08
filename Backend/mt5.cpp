//+------------------------------------------------------------------+
//|                                                         Data.mq5 |
//|                                  Copyright 2025, MetaQuotes Ltd. |
//|                                             https://www.mql5.com |
//+------------------------------------------------------------------+
#property copyright "Copyright 2025, MetaQuotes Ltd."
#property link      "https://www.mql5.com"
#property version   "1.00"

//define url
string price_url = "http://127.0.0.1:8001/price";
string symbol_url = "http://127.0.0.1:8001/symbol";
string ohlc_url = "http://127.0.0.1:8001/ohlc";
string socket_test = "ws://127.0.0.1/ws/tick";

void sendingBatchData(string url,string acc,string data){
   
   string combine = "{\""+acc+ "\":"+data+"}";
   Print("Sending data to FASTAPI: ", combine);
   string headers = "Content-Type: application/json\r\n";
   
   char result[];
   char postData[];
   string response;
   
   //StringToCharArray(data, postData);
   ArrayResize(postData, StringToCharArray(combine, postData, 0, WHOLE_ARRAY, CP_UTF8)-1);
   
   //sending process
   int res = WebRequest("POST",url,headers,0,postData,result,response);
   
   Print("Res code: ", res);
   if(res == 200) Print("Data sent successfully");
   else Print("Error: ",res);
}

string MakeTickJSON(
                     string symbol, 
                     double bid, 
                     double ask, 
                     int spread,
                     double swap_long,
                     double swap_short, 
                     string date) {
   string json = StringFormat(
            "\"%s\":{\"bid\":%.5f, \"ask\":%.5f, \"spread\":%d,\"swap_long\":%.5f, \"swap_short\":%.5f, \"date\":\"%s\"}", 
              symbol, bid, ask, spread, swap_long, swap_short, date);
   return json;
}
void PriceDataJson() {
   //idea: データ量が多くなら、別れて送った方がいいです
   Print("Starting batched JSON creation...");

   int total = SymbolsTotal(true);
   int batch_size = 30;
   string acc = IntegerToString(AccountInfoInteger(ACCOUNT_LOGIN));
   string jsonData = "{";

   for (int i = 0; i < total; i++) {
      string sym = SymbolName(i, true);
      if (StringLen(sym) == 0) continue;

      double bid = SymbolInfoDouble(sym, SYMBOL_BID);
      double ask = SymbolInfoDouble(sym, SYMBOL_ASK);
      int spread = SymbolInfoInteger(sym, SYMBOL_SPREAD);
      double swap_long = SymbolInfoDouble(sym, SYMBOL_SWAP_LONG);
      double swap_short = SymbolInfoDouble(sym, SYMBOL_SWAP_SHORT);
      string date = TimeToString(TimeCurrent(), TIME_DATE | TIME_MINUTES | TIME_SECONDS);

      jsonData += MakeTickJSON(sym, bid, ask, spread, swap_long, swap_short, date);

      if ((i + 1) % batch_size != 0 && i != total - 1) {
         jsonData += ",";
      }


      if ((i + 1) % batch_size == 0 || i == total - 1) {
         jsonData += "}";  

         Print("Sending batch ", i + 1 - batch_size + 1, " to ", i + 1);
         sendingBatchData(price_url,acc,jsonData);

         jsonData = "{";
         Sleep(5);  
      }
   }
}
//+------------------------------------------------------------------+
//| Symbolinfo                                                       |
//+------------------------------------------------------------------+
string MakeSymbolJSON(string acc,string sym, int digits, int stop_level, double contract_size) {
   return StringFormat(
      "{\"account\":\"%s\",\"symbol\":\"%s\", \"digits\":%d, \"stop_level\":%d, \"contractsize\":%.5f}",
      acc,sym, digits, stop_level, contract_size);
}


void SymbolJson() {
   int batch_size = 100;
   int total = SymbolsTotal(true);
   string acc = IntegerToString(AccountInfoInteger(ACCOUNT_LOGIN));
   string jsonData = "[";
   for(int i = 0; i < total; i++) {
      string sym = SymbolName(i, true);
      if(StringLen(sym) == 0) continue;

      int digits = SymbolInfoInteger(sym, SYMBOL_DIGITS);
      int stop_level = SymbolInfoInteger(sym, SYMBOL_TRADE_STOPS_LEVEL);
      double contract_size = SymbolInfoDouble(sym, SYMBOL_TRADE_CONTRACT_SIZE);
      jsonData += MakeSymbolJSON(acc,sym, digits, stop_level, contract_size);
      
      if ((i + 1) % batch_size != 0 && i != total - 1) {
         jsonData += ",";
      }


      if ((i + 1) % batch_size == 0 || i == total - 1) {
         jsonData += "]";  

         Print("Sending batch ", i + 1 - batch_size + 1, " to ", i + 1);
         sendingBatchData(symbol_url, acc,jsonData);

         jsonData = "[";
         Sleep(5);  
      }
   }
}

//+------------------------------------------------------------------+
//| OHLCinfo                                                         |
//+------------------------------------------------------------------+
string MakeOHLCJson(string sym, double high, double low, double open, double close, string date) {
   string json = StringFormat(
            "\"%s\":{\"high\":%.5f, \"low\":%.5f, \"open\":%.5f, \"close\":%.5f, \"date\":\"%s\"}", 
              sym, high, low, open, close, date);
   return json;
}

void OHLCInfo() {
   int batch_size = 100;
   int total = SymbolsTotal(true);
   string account =IntegerToString( AccountInfoInteger(ACCOUNT_LOGIN));
   string jsonData = "{";
   for (int i = 0; i < total; i++) {
      string sym = SymbolName(i, true);
      if(StringLen(sym) == 0) continue;
      
      double open = iOpen(sym,PERIOD_M1,0);
      double high = iHigh(sym,PERIOD_M1,0);
      double low = iLow(sym,PERIOD_M1,0);
      double close = iClose(sym,PERIOD_M1,0);
      string date = TimeToString(TimeCurrent(), TIME_DATE|TIME_MINUTES|TIME_SECONDS);
      jsonData += MakeOHLCJson(sym,high,low,open,close,date);
      
      if((i+1)%batch_size != 0 && i != total -1){
         jsonData += ",";
      }
      
      if((i+1)%batch_size == 0 || i == total -1){
         jsonData += "}";
         sendingBatchData(ohlc_url,account,jsonData);
         jsonData = "{";
         Sleep(5);
      }
      
   }
   
}
//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
  {
//--- create timer
   EventSetTimer(5);
//TestStaticRequest();
   Print("Function is calling...");
   PriceDataJson();
   //SymbolJson();
   OHLCInfo();
//PositionData();

//---
   return(INIT_SUCCEEDED);
  }
//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
//--- destroy timer
   EventKillTimer();

  }
//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
  {
//---
Print("Function is calling...");
   PriceDataJson();
   //SymbolJson();
   OHLCInfo();
//TestStaticRequest();

  }
//+------------------------------------------------------------------+
//| Timer function                                                   |
//+------------------------------------------------------------------+
void OnTimer()
  {
//---
Print("Function is calling...");
  PriceDataJson();
  //SymbolJson();
  OHLCInfo();
//PositionData();
//TestStaticRequest();
  }