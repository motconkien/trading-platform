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

void sendingBatchData(string url,string data){
   Print("Sending data to FASTAPI: ", data);
   
   string headers = "Content-Type: application/json\r\n";
   
   char result[];
   char postData[];
   string response;
   
   //StringToCharArray(data, postData);
   ArrayResize(postData, StringToCharArray(data, postData, 0, WHOLE_ARRAY, CP_UTF8)-1);
   
   //sending process
   int res = WebRequest("POST",url,headers,0,postData,result,response);
   
   Print("Res code: ", res);
   if(res == 200) Print("Data sent successfully");
   else Print("Error: ",res);
}

string MakeTickJSON(string account,
                     string symbol, 
                     double bid, 
                     double ask, 
                     int spread,
                     double swap_long,
                     double swap_short, 
                     string date) {
   string json = StringFormat(
            "{\"account\":\"%s\",\"symbol\":\"%s\", \"bid\":%.5f, \"ask\":%.5f, \"spread\":%d,\"swap_long\":%.5f, \"swap_short\":%.5f, \"date\":\"%s\"}", 
              account, symbol, bid, ask, spread, swap_long, swap_short, date);
   return json;
}
void PriceDataJson() {
   //idea: データ量が多くなら、別れて送った方がいいです
   Print("Starting batched JSON creation...");

   int total = SymbolsTotal(true);
   int batch_size = 10;
   string acc = IntegerToString(AccountInfoInteger(ACCOUNT_LOGIN));
   string jsonData = "[";

   for (int i = 0; i < total; i++) {
      string sym = SymbolName(i, true);
      if (StringLen(sym) == 0) continue;

      double bid = SymbolInfoDouble(sym, SYMBOL_BID);
      double ask = SymbolInfoDouble(sym, SYMBOL_ASK);
      int spread = SymbolInfoInteger(sym, SYMBOL_SPREAD);
      double swap_long = SymbolInfoDouble(sym, SYMBOL_SWAP_LONG);
      double swap_short = SymbolInfoDouble(sym, SYMBOL_SWAP_SHORT);
      string date = TimeToString(TimeCurrent(), TIME_DATE | TIME_MINUTES | TIME_SECONDS);

      jsonData += MakeTickJSON(acc, sym, bid, ask, spread, swap_long, swap_short, date);

      if ((i + 1) % batch_size != 0 && i != total - 1) {
         jsonData += ",";
      }


      if ((i + 1) % batch_size == 0 || i == total - 1) {
         jsonData += "]";  

         Print("Sending batch ", i + 1 - batch_size + 1, " to ", i + 1);
         sendingBatchData(price_url,jsonData);

         jsonData = "[";
         Sleep(5);  
      }
   }
}
//+------------------------------------------------------------------+
//| Symbolinfo                                                       |
//+------------------------------------------------------------------+
struct SymbolInfo {
   int digits;
   int stop_level;
   double contract_size;
};

string symbols[];
SymbolInfo infos[];

int findIndex(string sym) {
   int size = ArraySize(symbols);
   for(int i = 0; i < size; i++) {
      if(symbols[i] == sym) return i;
   }
   return -1;
}

string MakeSymbolJSON(string acc,string sym, int digits, int stop_level, double contract_size) {
   return StringFormat(
      "{\"account\":\"%s\",\"symbol\":\"%s\", \"digits\":%d, \"stop_level\":%d, \"contractsize\":%.5f}",
      acc,sym, digits, stop_level, contract_size);
}

bool IsSameInfo(SymbolInfo &a, SymbolInfo &b) {
   return a.digits == b.digits
       && a.stop_level == b.stop_level
       && MathAbs(a.contract_size - b.contract_size) < 0.00001;
}

void SymbolJson() {
   int batch_size = 10;
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
         sendingBatchData(symbol_url, jsonData);

         jsonData = "[";
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
   //PriceDataJson();
   SymbolJson();
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
   //PriceDataJson();
   SymbolJson();
//TestStaticRequest();

  }
//+------------------------------------------------------------------+
//| Timer function                                                   |
//+------------------------------------------------------------------+
void OnTimer()
  {
//---
Print("Function is calling...");
  //PriceDataJson();
  SymbolJson();
//PositionData();
//TestStaticRequest();
  }