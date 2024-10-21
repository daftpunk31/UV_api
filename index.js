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

function replaceCommasAndSpaces(inputString) {
  return inputString.replace(/[, ]+/g, '+');
}
// Example usage
// const originalString = "Chaitanyapuri, Hyderabad";
// const modifiedString = replaceCommasAndSpaces(originalString);
// console.log(modifiedString);


app.get("/", async(req, res) => {
  res.render("index.ejs",{content:"Waiting for input..."});
});

app.post("/get-uv-details", async(req, res) => {
  // const lati = req.body.latitude;
  // const long = req.body.longitude;
  const loc = replaceCommasAndSpaces(req.body.location);
  const originaLoc = req.body.location;
  console.log(loc);

  const DM_API_URL1 = `https://api-v2.distancematrix.ai/maps/api/geocode/json?address=${loc}&key=mSnda8WyU3EzinJuNQrKzdhpxH4EyYC9HfwYKdC603hOpKH0MxAHsIcdhgkkRJFS`
  // const UV_API_URL1 = `https://api.openuv.io/api/v1/uv?lat=${lati}&lng=${long}&alt=${alt}&dt=${dt}`;

  const UNSP_API_URL = `https://api.unsplash.com/search/photos/?client_id=RcluQ-upDdw5BRwGdXGEJr3gpx92d2Z6hetV_KHccbI&query=${loc}&count=1`
  

  try{
    // const uv_api_data1 = await axios.get(UV_API_URL1,config);
    // const uvMax = uv_api_data1.data.result.uv_max;
    const dm_api_response = await axios.get(DM_API_URL1);
    const unsp_api_response = await axios.get(UNSP_API_URL);
    // console.log("hi");
    
    // api_data = JSON.stringify(api_data.data);
    // var temp = 0;
    
    // api_data.data.result.forEach(item => {
      //   console.log(item.uv);
      // });
      
      // const dm_api_data = JSON.parse(dm_api_response);
      const lati = dm_api_response.data.result[0].geometry.location.lat;
      const long = dm_api_response.data.result[0].geometry.location.lng;
      const unsp_api_data = unsp_api_response.data.results[0].urls.regular;
      // console.log(unsp_api_data);

      // console.log("hello");
      
      const alt=500;
      const dt="";
      const UV_API_URL2 = `https://api.openuv.io/api/v1/forecast?lat=${lati}&lng=${long}&alt=${alt}&dt=${dt}`;
      const uv_api_data2 = await axios.get(UV_API_URL2,config);

    console.log(loc)
    console.log(lati);
    console.log(long);
    console.log(alt);
    console.log(dt);

    let uValues = uv_api_data2.data.result.map(item => item.uv);
    let uvValuesLen = uValues.length;
    let sum = 0;
    // console.log(uValues)
    for(let i=0;i<uvValuesLen;i++){
      sum+=uValues[i];
    }

    const uvAvg = (sum / uvValuesLen).toFixed(2);

    // console.log(sum);
    console.log("Average UV index is:",uvAvg);

    // console.log("Today's maximum UV will be: ",uvMax);
    

    if(uvAvg > 3){
      res.render("index.ejs",{content:`Today's UV Index in ${originaLoc} is high; Averging at:${uvAvg}. \n Please apply sunscreen.`,imageUrl: unsp_api_data});
    }
    else{
      res.render("index.ejs",{content:`Today's UV Index in ${originaLoc} is low; Averging at:${uvAvg}. \n No need to apply sunscreen.`,imageUrl: unsp_api_data});
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