const express=require("express")

const path=require("path")

const {open}=require("sqlite")
const sqlite3=require("sqlite3")
const app=express()

const dbPath=path.join(__dirname,"covid19India.db")

const db=null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
const convertToDbobj=(dbObj)=>{
    return {
            stateId:dbObj.state_id,
            stateName:dbObj.state_name,
            population:dbObj.population
    }
}


app.get("/states/",async(request,response)=>{
    const getQuery=`
    SELECT * FROM state
    ORDER BY state_id;
    `;
    const states=await db.all(getQuery)

    response.send(states.map((eachState)=>
        convertToDbobj(eachState)
    )


    );
});

const convertTodbObj=(dbObj)=>{
  return{
    stateId:dbObj.state_id,
    stateName:dbObj.state_name,
    population:dbObj.population

  }
}
app.get("/states/:stateId/",async(request,response)=>{
  const {stateId}=request.params
  const getQuery=`
      SELECT * FROM 
      state
      WHERE state_id=${stateId};
  `;
const dbRes=await db.get(getQuery)
response.send(convertTodbObj(dbRes)

);
});

app.post("/districts/",async(request,response)=>{
  const{
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths

  }=request.body

  const addQuery=`
    INSERT INTO district (district_name,state_id,cases,cured,active,deaths)
    VALUES(
      '${districtName}',
      ${stateId},
      '${cases}',
      '${cured}',
      '${active}',
      '${deaths}'

    ); 

  `;
  const dbRes=await db.run(addQuery)
  response.send("District Successfully Added")
});

const convertTodbObj=(dbObj)=>{
  return {
        districtId:dbObj.district_id,
        districtName:dbObj.district_name,
        stateId:dbObj.state_id,
        cases:dbObj.cases,
        cured:dbObj.cases,
        active:dbObj.active,
        deaths:dbObj.deaths
  }
}
app.get("/districts/:districtId/",async(request,response)=>{
  const {districtId}=request.params;
  const getQuery=`
  SELECT * FROM 
  district 
  WHERE 
  district_id=${districtId};

  `;
  const dbRes=await db.get(getQuery);
  response.send(
  convertTodbObj(dbRes))
};

app.delete("/districts/:districtId/",async(request,response)=>{
  const {districtId}=request.params;
  const delQuery=`
  DELETE FROM
  district
  WHERE district_id=${districtId}; 

  `;
  await db.run(delQuery);
  response.send("District Removed")

});

app.put("/districts/:districtId/",async(request,response)=>{
  const {districtId}=request.params;
  const{
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths
  }=request.body;
  const updateQuery=`
  UPDATE district SET
  district_name='${districtName}',
  state_id=${stateId},
  cases=${cases},
  cured=${cured},

  active=${active},

  deaths=${deaths}
  WHERE 
district_id=${districtId};

  `;
  await db.run(updateQuery)
  response.send("District Detilas Updated")




});



app.get("/states/:stateId/stats/",async(request,response)=>{
  const {stateId}=request.params;
  const getStateStatsQuery=`
  SELECT 
  SUM(cases),
  SUM(cured),
  SUM(active),
  SUM(deaths)
  
   FROM 
  WHERE 
  state_id=${stateId};
  `;
  const stats=await db.get(getStateStatsQuery);
  response.send({
    totalCases:stats["SUM(cases)"],
  totalCured:stats["SUM(cured)"],
  totalActive:stats["SUM(active)"],
  totalDeaths:stats["SUM(deaths)"]
    
  
  });
});


app.get("/districts/:districtId/details/",async(request,response)=>{
  const {districtId}=request.params;
  const getDistrictIdQuery=`
  SELECT state_id FROM district
  WHERE district_id=${districtId};
  `;
  const getDistrictIdResponse=await db.get(getDistrictIdQuery)

  const getStateNameQuery=`
  SELECT 
  state_name as stateName 
  FROM state
  WHERE state_id=${getDistrictIdResponse.state_id};
  `;
  const getStateName=await db.get(getStateNameQuery)
  response.send(getStateName);});

module.exports=app