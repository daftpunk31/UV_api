import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import axios from "axios";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

const port = process.env.PORT || 3000;

const accessToken = "openuv-3pre8rm2fu30qb-io";
const config = {
  headers: { 'x-access-token': `${accessToken}` },
};

app.use(express.static("public")); // Serve static files from the "public" directory
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", async(req, res) => {
  res.render("index.ejs",{content:"Waiting for input..."});
});

app.post("/get-uv-details", async(req, res) => {
  const lati = req.body.latitude;
  const long = req.body.longitude;
  const alt=500;
  const dt="";
  console.log(lati);
  console.log(long);
  console.log(alt);
  console.log(dt);
  const API_URL = `https://api.openuv.io/api/v1/uv?lat=${lati}&lng=${long}&alt=${alt}&dt=${dt}`;

  const API_URL2 = `https://api.openuv.io/api/v1/forecast?lat=${lati}&lng=${long}&alt=${alt}&dt=${dt}`;

  try{
    const api_data = await axios.get(API_URL,config);

    const api_data2 = await axios.get(API_URL2,config);


    const uvMax = api_data.data.result.uv_max;

    // api_data = JSON.stringify(api_data.data);

    // var temp = 0;

    // api_data.data.result.forEach(item => {
    //   console.log(item.uv);
    // });

    let uValues = api_data2.data.result.map(item => item.uv);

    let uvValuesLen = uValues.length;
    let sum = 0;

    // console.log(uValues)

    for(let i=0;i<uvValuesLen;i++){
      sum+=uValues[i];
    }

    const uvAvg = sum/uvValuesLen;

    // console.log(sum);
    console.log("Average UV index is:",uvAvg);

    // console.log("hello");
    console.log("Today's maximum UV will be: ",uvMax);
    // console.log("world");

    if(uvAvg > 3){
      res.render("index.ejs",{content:`Today's UV Index is high Avg:${uvAvg} . Please apply sunscreen.`});
    }
    else{
      res.render("index.ejs",{content:`Today's UV Index is low Avg:${uvAvg}. No need to apply sunscreen.`});
    }

  }
  catch(error){
    console.log(error.response);
  }
});

// write your server code here....

app.listen(port,()=>{
  console.log(`Server is running on port ${port}`);
})