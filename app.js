var firebase = require("firebase"),
  express = require("express"),
  app = express(),
  expressSanitizer = require("express-sanitizer"),
  bodyParser = require("body-parser"),
  methodOverride = require("method-override");

const firebaseConfig = {
  // Your web app's Firebase configuration
};
var bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
const { response, urlencoded } = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
var serviceAccount = require("./serviceAccountKey.json");
const { Console } = require("console");
var isAdmin = false;
var LocalStorage = require("node-localstorage").LocalStorage,
  localStorage = new LocalStorage("./scratch");
var FBinstituteName = [];
var FBrentalName = [];
var FBauditSubmissionDate = [];
var FBDataKey = [];
var NFBinstituteName = [];
var NFBrentalName = [];
var NFBauditSubmissionDate = [];
var NFBDataKey = [];

var FNBLandingPageData = [];
var NonFNBLandingPageData = [];

var FNBsectionOneChecklistAns;
var FNBsectionTwoChecklistAns;
var FNBsectionThreeChecklistAns;
var FNBsectionFourChecklistAns;
var FNBsectionFiveChecklistAns;

var NonFNBsectionOneChecklistAns = [];
var NonFNBsectionTwoChecklistAns = [];
var NonFNBsectionThreeChecklistAns = [];

var NonFNBChecklistQuestions = [];
var FNBChecklistQuestions = [];

function clearAllFNBAuditData() {
  FNBsectionOneChecklistAns = {};
  FNBsectionTwoChecklistAns = {};
  FNBsectionThreeChecklistAns = {};
  FNBsectionFourChecklistAns = {};
  FNBsectionFiveChecklistAns = {};
}

function clearAllNonFNBAuditData() {
  NonFNBsectionOneChecklistAns = {};
  NonFNBsectionTwoChecklistAns = {};
  NonFNBsectionThreeChecklistAns = {};
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://auditchecklist-fc4ff.firebaseio.com",
});

const csrfMiddleware = csrf({ cookie: true });

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(expressSanitizer());
app.use(bodyParser.json());
app.use(cookieParser());
//app.use(csrfMiddleware);

/*
app.all("*", (req, res, next) => {
  var url = req.url;
  console.log("Url requesting cookies is: ", url);
  console.log("Cookie is: ", req.csrfToken());
  res.cookie("XSRF-TOKEN", req.csrfToken());
  next();
}); */

app.get("/login", function (req, res) {
  isAdmin = false;
  res.render("pages/login");
});

app.get("/RegisteredAccounts", async function (req, res) {
  //Get email from database and pass it into webpage
  if (isAdmin == true) {
    let response;
    var registeredEmails = [];
    registeredEmails = await getRegisteredEmail();
    for (var i = 0; i < registeredEmails.length; i++) {
      registeredEmails[i] = registeredEmails[i].replace(/"/g, "");
    }
    //console.log("Emails:" + registeredEmails);
    res.render("pages/RegisteredAccounts", { registeredEmails });
  } else {
    res.redirect("/landingPage");
  }
});

async function getRegisteredEmail() {
  var registeredEmails = [];
  let promise = new Promise((resolve, reject) => {
    var query = firebase.database().ref("/SingHealthAcc").orderByKey();
    query.on("value", function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var key = childSnapshot.key;
        var childData = childSnapshot.val();
        //console.log("Key: " + key);
        //console.log("childData: " + JSON.stringify(childData.Email));
        registeredEmails.push(JSON.stringify(childData.Email));
        //console.log(Object.values(childData.Data)[0]); // change
      });
      resolve();
    });
  });
  let result = await promise;
  return registeredEmails;
}

async function getKeyFromRegisteredEmail(email) {
  var key;
  let promise = new Promise((resolve, reject) => {
    var query = firebase.database().ref("/SingHealthAcc").orderByKey();
    query.on("value", function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var childData = childSnapshot.val();
        if (email == childData.Email) {
          key = childSnapshot.key;
          resolve();
        }
        //console.log(Object.values(childData.Data)[0]); // change
      });
    });
  });
  let result = await promise;
  return key;
}

app.get("/signup", function (req, res) {
  if (isAdmin == true) {
    res.render("pages/signup");
  } else {
    res.redirect("/landingPage");
  }
});

app.get("/", function (req, res) {
  res.redirect("/login");
});
app.get("/forgetpass", function (req, res) {
  res.render("pages/forgetpass");
});

app.get("/", function (req, res) {
  res.redirect("/forgetpass");
});

app.get("/EditChecklistQuestions", async function (req, res) {
  var SectionOneNonFBProfessionalism = [];
  var SectionOneNonFBStaffHygiene = [];
  var SectionTwoNonFBGEC = [];
  var SectionThreeNonFBElectricalSafety = [];
  var SectionThreeNonFBFireEmergencySafety = [];
  var SectionThreeNonFBGeneralSafety = [];

  var SectionOneFBProfessionalism = [];
  var SectionOneFBStaffHygiene = [];
  var SectionTwoFBGEC = [];
  var SectionTwoFBHHF = [];
  var SectionThreeFBStoragePrep = [];
  var SectionThreeFBStorageFridgeOrWarmer = [];
  var SectionFourFBBeverage = [];
  var SectionFourFBFood = [];
  var SectionFiveFBElectricalSafety = [];
  var SectionFiveFBFireSafety = [];
  var SectionFiveFBGeneralSafety = [];

  //Get Checklist Questions in 2d Array?
  SectionOneNonFBProfessionalism = await getCheckListQn(
    "Non-F&B-AuditQuestion",
    "SectionOne",
    "Professionalism"
  );
  SectionOneNonFBStaffHygiene = await getCheckListQn(
    "Non-F&B-AuditQuestion",
    "SectionOne",
    "Staff Hygiene"
  );
  SectionTwoNonFBGEC = await getCheckListQn(
    "Non-F&B-AuditQuestion",
    "SectionTwo",
    "General Environment Cleanliness"
  );
  SectionThreeNonFBElectricalSafety = await getCheckListQn(
    "Non-F&B-AuditQuestion",
    "SectionThree",
    "Electrical Safety"
  );
  SectionThreeNonFBFireEmergencySafety = await getCheckListQn(
    "Non-F&B-AuditQuestion",
    "SectionThree",
    "Fire & Emergency Safety"
  );
  SectionThreeNonFBGeneralSafety = await getCheckListQn(
    "Non-F&B-AuditQuestion",
    "SectionThree",
    "General Safety"
  );

  SectionOneFBProfessionalism = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionOne",
    "Professionalism"
  );
  SectionOneFBStaffHygiene = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionOne",
    "Staff Hygiene"
  );
  SectionTwoFBGEC = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionTwo",
    "General Environment Cleanliness"
  );
  SectionTwoFBHHF = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionTwo",
    "Hand Hygiene Facilities"
  );
  SectionThreeFBStoragePrep = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionThree",
    "Storage & Preparation of Food"
  );
  SectionThreeFBStorageFridgeOrWarmer = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionThree",
    "Storage of Food in Refrigerator or Warmer"
  );
  SectionFourFBBeverage = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionFour",
    "Beverage"
  );
  SectionFourFBFood = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionFour",
    "Food"
  );
  SectionFiveFBElectricalSafety = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionFive",
    "Electrical Safety"
  );
  SectionFiveFBFireSafety = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionFive",
    "Fire & Emergency Safety"
  );
  SectionFiveFBGeneralSafety = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionFive",
    "General Safety"
  );

  res.render("pages/EditChecklistQuestions", {
    SectionOneNonFBProfessionalism,
    SectionOneNonFBStaffHygiene,
    SectionTwoNonFBGEC,
    SectionThreeNonFBElectricalSafety,
    SectionThreeNonFBFireEmergencySafety,
    SectionThreeNonFBGeneralSafety,
    SectionOneFBProfessionalism,
    SectionOneFBStaffHygiene,
    SectionTwoFBGEC,
    SectionTwoFBHHF,
    SectionThreeFBStoragePrep,
    SectionThreeFBStorageFridgeOrWarmer,
    SectionFourFBBeverage,
    SectionFourFBFood,
    SectionFiveFBElectricalSafety,
    SectionFiveFBFireSafety,
    SectionFiveFBGeneralSafety,
  });
});

async function getCheckListQn(dataDirectory, Section, subSection) {
  var QuestionArray = [];
  let promise = new Promise((resolve, reject) => {
    var query = firebase
      .database()
      .ref("/" + dataDirectory)
      .orderByKey();
    query.on("value", function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var key = childSnapshot.key;
        //console.log(key);
        if (Section == key) {
          childSnapshot.forEach(function (childSnapshot2) {
            //console.log("ChildSnapshot2 key: " + childSnapshot2.val());
            if (childSnapshot2.key == subSection) {
              childSnapshot2.forEach(function (childSnapshot3) {
                QuestionArray.push(childSnapshot3.val());
              });
            }
          });
        }
        resolve();
      });
    });
  });
  let result = await promise;
  return QuestionArray;
}

app.get("/RemoveQuestion/:Section/:SubSection", async function (req, res) {
  var AuditSection = req.params.Section;
  var AuditSubSection = req.params.SubSection;
  var check = AuditSection.substring(0, 3);
  var key;
  if (check == "NFB") {
    AuditSection = AuditSection.substring(3);
    key = await getKeyFromQn(true, AuditSection, AuditSubSection);
    key = parseInt(key, 10);
    database
      .ref(
        "Non-F&B-AuditQuestion/" +
          AuditSection +
          "/" +
          AuditSubSection +
          "/" +
          key
      )
      .remove();
  } else {
    AuditSection = AuditSection.substring(2);
    key = await getKeyFromQn(false, AuditSection, AuditSubSection);
    key = parseInt(key, 10);
    database
      .ref(
        "F&B-AuditQuestion/" + AuditSection + "/" + AuditSubSection + "/" + key
      )
      .remove();
  }
  res.redirect("/EditChecklistQuestions");
});

app.get("/AddQuestion/:Section/:SubSection", async function (req, res) {
  var AuditSection = req.params.Section;
  var AuditSubSection = req.params.SubSection;
  console.log(AuditSection);
  console.log(AuditSubSection);
  var check = AuditSection.substring(0, 3);
  var key;
  if (check == "NFB") {
    AuditSection = AuditSection.substring(3);
    key = await getKeyFromQn(true, AuditSection, AuditSubSection);
    console.log("Key is: " + key);
    console.log(
      "Non-F&B-AuditQuestion/" + AuditSection + "/" + AuditSubSection
    );
    key = parseInt(key, 10) + 1;
    database
      .ref("Non-F&B-AuditQuestion/" + AuditSection + "/" + AuditSubSection)
      .update({ [key]: "" });
  } else {
    AuditSection = AuditSection.substring(2);
    key = await getKeyFromQn(false, AuditSection, AuditSubSection);
    key = parseInt(key, 10) + 1;
    database
      .ref("F&B-AuditQuestion/" + AuditSection + "/" + AuditSubSection)
      .update({ [key]: "" });
  }
  res.redirect("/EditChecklistQuestions");
});

async function getKeyFromQn(NFB, section, subsection) {
  var key = [];
  var query;
  let promise = new Promise((resolve, reject) => {
    if (NFB == true) {
      query = firebase.database().ref("/Non-F&B-AuditQuestion").orderByKey();
    } else {
      query = firebase.database().ref("/F&B-AuditQuestion").orderByKey();
    }
    query.on("value", function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        if (section == childSnapshot.key) {
          childSnapshot.forEach(function (childSnapshot2) {
            if (subsection == childSnapshot2.key) {
              childSnapshot2.forEach(function (childSnapshot3) {
                key.push(childSnapshot3.key);
              });
            }
          });
        }
      });
      resolve();
    });
  });
  let result = await promise;
  return key[key.length - 1];
}

app.post("/UpdateQuestions", async function (req, res) {
  var NFBQuestionProfessionalSectionOne =
    req.body.NFBProfessionalismSectionOneQn;
  var NFBQuestionStaffHygieneSectionOne = req.body.NFBStaffHygieneSectionOneQn;
  var NFBQuestionGECSectionTwo = req.body.NFBGECSectionTwoQn;
  var NFBQuestionGeneralSafetySectionThree =
    req.body.NFBGeneralSafetySectionThreeQn;
  var NFBQuestionFireEmergencySafetySectionThree =
    req.body.NFBFireEmergencySafetySectionThreeQn;
  var NFBQuestionElectricalSafetySectionThree =
    req.body.NFBElectricalSafetySectionThreeQn;

  var FBQuestionProfessionalismSectionOne =
    req.body.FBProfessionalismSectionOneQn;
  var FBQuestionStaffHygieneSectionOne = req.body.FBStaffHygieneSectionOneQn;
  var FBQuestionGECSectionTwo = req.body.FBGECSectionTwoQn;
  var FBQuestionHHFSectionTwo = req.body.FBHHFSectionTwoQn;
  var FBQuestionStoragePrepSectionThree = req.body.FBStoragePrepSectionThreeQn;
  var FBQuestionStorageFridgeOrWarmerSectionThree =
    req.body.FBStorageFridgeOrWarmerSectionThreeQn;
  var FBQuestionFoodSectionFour = req.body.FBFoodSectionFourQn;
  var FBQuestionBeverageSectionFour = req.body.FBBeverageSectionFourQn;
  var FBQuestionGeneralSafetySectionFive =
    req.body.FBGeneralSafetySectionFiveQn;
  var FBQuestionFireSafetySectionFive = req.body.FBFireSafetySectionFiveQn;
  var FBQuestionElectricalSafetySectionFive =
    req.body.FBElectricalSafetySectionFiveQn;

  //Update NFB checklist
  await updateQnChecklist(
    true,
    "SectionOne",
    "Professionalism",
    NFBQuestionProfessionalSectionOne
  );
  await updateQnChecklist(
    true,
    "SectionOne",
    "Staff Hygiene",
    NFBQuestionStaffHygieneSectionOne
  );
  await updateQnChecklist(
    true,
    "SectionTwo",
    "General Environment Cleanliness",
    NFBQuestionGECSectionTwo
  );
  await updateQnChecklist(
    true,
    "SectionThree",
    "General Safety",
    NFBQuestionGeneralSafetySectionThree
  );
  await updateQnChecklist(
    true,
    "SectionThree",
    "Fire & Emergency Safety",
    NFBQuestionFireEmergencySafetySectionThree
  );
  await updateQnChecklist(
    true,
    "SectionThree",
    "Electrical Safety",
    NFBQuestionElectricalSafetySectionThree
  );

  //Update FB checklist
  await updateQnChecklist(
    false,
    "SectionOne",
    "Professionalism",
    FBQuestionProfessionalismSectionOne
  );
  await updateQnChecklist(
    false,
    "SectionOne",
    "Staff Hygiene",
    FBQuestionStaffHygieneSectionOne
  );
  await updateQnChecklist(
    false,
    "SectionTwo",
    "General Environment Cleanliness",
    FBQuestionGECSectionTwo
  );
  await updateQnChecklist(
    false,
    "SectionTwo",
    "Hand Hygiene Facilities",
    FBQuestionHHFSectionTwo
  );
  await updateQnChecklist(
    false,
    "SectionThree",
    "Storage & Preparation of Food",
    FBQuestionStoragePrepSectionThree
  );
  await updateQnChecklist(
    false,
    "SectionThree",
    "Storage of Food in Refrigerator or Warmer",
    FBQuestionStorageFridgeOrWarmerSectionThree
  );
  await updateQnChecklist(
    false,
    "SectionFour",
    "Food",
    FBQuestionFoodSectionFour
  );
  await updateQnChecklist(
    false,
    "SectionFour",
    "Beverage",
    FBQuestionBeverageSectionFour
  );
  await updateQnChecklist(
    false,
    "SectionFive",
    "General Safety",
    FBQuestionGeneralSafetySectionFive
  );
  await updateQnChecklist(
    false,
    "SectionFive",
    "Fire & Emergency Safety",
    FBQuestionFireSafetySectionFive
  );
  await updateQnChecklist(
    false,
    "SectionFive",
    "Electrical Safety",
    FBQuestionElectricalSafetySectionFive
  );

  res.redirect("/EditChecklistQuestions");
});

async function updateQnChecklist(NFB, section, subsection, data) {
  var dirPath;
  let promise = new Promise((resolve, reject) => {
    if (NFB == true) {
      dirPath = "Non-F&B-AuditQuestion/";
    } else {
      dirPath = "F&B-AuditQuestion/";
    }
    database
      .ref(dirPath + section + "/" + subsection)
      .set(data, function (err) {
        if (err) {
          console.log("Error Creating:" + error);
          res.render("new");
          reject();
        } else {
          //console.log("Create successful!");
          resolve();
        }
      });
  });
  let result = await promise;
  return false;
}

app.get("/landingPage", async function (req, res) {
  const sessionCookie = req.cookies.session || "";
  var loginEmail = req.cookies.loginEmail;
  var username = loginEmail.split("@")[0];
  //Get auditformname data
  await getLandingPageData(username);
  //check if admin
  if (loginEmail == "admin@gmail.com") isAdmin = true;
  console.log(isAdmin);
  if (isAdmin == true) {
    admin
      .auth()
      .verifySessionCookie(sessionCookie, true)
      .then(() => {
        clearAllFNBAuditData();
        clearAllNonFNBAuditData();
        res.render("pages/landingPageAdmin", {
          NonFNBLandingPageData,
          FNBLandingPageData,
        });
      })
      .catch((error) => {
        clearAllFNBAuditData();
        clearAllNonFNBAuditData();
        res.redirect("/login");
      });
  } else {
    admin
      .auth()
      .verifySessionCookie(sessionCookie, true)
      .then(() => {
        clearAllFNBAuditData();
        clearAllNonFNBAuditData();
        res.render("pages/landingPage", {
          NonFNBLandingPageData,
          FNBLandingPageData,
        });
      })
      .catch((error) => {
        clearAllFNBAuditData();
        clearAllNonFNBAuditData();
        res.redirect("/login");
      });
  }
});

async function getLandingPageData(sessionLogin) {
  NonFNBLandingPageData = [];
  FNBLandingPageData = [];
  //Clear all data
  var NonFBDir = "Non-F&B-Checklist/" + sessionLogin + "/AuditAnswers";
  var FBDir = "F&B-Checklist/" + sessionLogin + "/AuditAnswers";

  let promise = new Promise((resolve, reject) => {
    var query = firebase.database().ref(NonFBDir).orderByKey();
    query.on("value", function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var childData = childSnapshot.val();
        NonFNBLandingPageData.push(childData.AuditFormName);
      });
      resolve();
    });
  });
  let result = await promise;

  let promise2 = new Promise((resolve, reject) => {
    var query = firebase.database().ref(FBDir).orderByKey();
    query.on("value", function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var childData = childSnapshot.val();
        FNBLandingPageData.push(childData.AuditFormName);
      });
      resolve();
    });
  });
  let result2 = await promise2;
}

app.get("/resetpassword", function (req, res) {
  res.render("pages/resetpassword");
});
app.get("/fullpage1-NonFB/:id", (req, res) => {
  const sessionCookie = req.cookies.session || "";
  var sessionLogin = req.cookies.loginEmail;
  sessionLogin = sessionLogin.split("@")[0];
  const dataID = req.params.id;
  var checklistData;

  var ref = firebase
    .database()
    .ref("Non-F&B-Checklist/" + sessionLogin + "/AuditAnswers");
  ref.on("value", getAllData);
  //console.log(checklistData);
  //var firebaseData = database.ref("F&B-Checklist/" + dataID);
  var NFBData = Object.values(checklistData);

  var NFBinstituteName = checklistData.SelectedInstituion;
  var NFBName = checklistData.AuditFormName;
  var NFBSectionOneTotal = checklistData.SectionOneTotal;
  var NFBSectionTwoTotal = checklistData.SectionTwoTotal;
  var NFBSectionThreeTotal = checklistData.SectionThreeTotal;
  var NFBSectionOneImage = checklistData.SectionOneImage;
  var NFBSectionOneImage2 = checklistData.SectionOneImage2;
  var NFBSectionOneRemarks = checklistData.SectionOneRemarks;
  var NFBSectionTwoRemarks = checklistData.SectionTwoRemarks;
  var NFBSectionThreeRemarks = checklistData.ectionThreeRemark;
  var NFBrentalName = checklistData.SelectedRetailTenant;
  var NFBauditSubmissionDate = checklistData.created;
  var NFBSectionTwoImage = checklistData.SectionTwoImage;
  var NFBSectionTwoImage2 = checklistData.SectionTwoImage2;
  var NFBSectionThreeImage = checklistData.SectionThreeImage;
  var NFBSectionThreeImage2 = checklistData.SectionThreeImage2;
  res.render("pages/fullpage1-NonFB", {
    sessionLogin,
    NFBSectionOneImage,
    NFBSectionOneImage2,
    NFBSectionTwoImage2,
    dataID,
    NFBSectionThreeImage,
    NFBSectionThreeImage2,
    NFBSectionTwoImage,
    NFBName,
    NFBinstituteName,
    NFBrentalName,
    NFBSectionOneTotal,
    NFBSectionTwoTotal,
    NFBSectionThreeTotal,
    NFBSectionOneRemarks,
    NFBSectionTwoRemarks,
    NFBSectionThreeRemarks,

    NFBauditSubmissionDate,
    NFBData,
  });

  clearAllNonFNBAuditData();
  function getAllData(data) {
    console.log("Getting all data");
    var auditScores = data.val();
    checklistData = auditScores[dataID];
  }
});
app.get("/View-NFB/:id/:email", (req, res) => {
  const dataID = req.params.id;
  const sessionLogin = req.params.email;
  var checklistData;
  const userId = dataID + sessionLogin;
  console.log(userId);

  const additionalClaims = {
    viewer: true,
  };
  console.log(additionalClaims);
  admin
    .auth()
    .createCustomToken(userId, additionalClaims)
    .then((customToken) => {
      // Send token back to client

      var ref = firebase
        .database()
        .ref("Non-F&B-Checklist/" + sessionLogin + "/AuditAnswers");
      ref.on("value", getAllData);
      //console.log(checklistData);
      //var firebaseData = database.ref("F&B-Checklist/" + dataID);
      var NFBData = Object.values(checklistData);

      var NFBinstituteName = checklistData.SelectedInstituion;
      var NFBName = checklistData.AuditFormName;
      var NFBSectionOneTotal = checklistData.SectionOneTotal;
      var NFBSectionTwoTotal = checklistData.SectionTwoTotal;
      var NFBSectionThreeTotal = checklistData.SectionThreeTotal;
      var NFBSectionOneRemarks = checklistData.SectionOneRemarks;
      var NFBSectionTwoRemarks = checklistData.SectionTwoRemarks;
      var NFBSectionThreeRemarks = checklistData.ectionThreeRemark;
      var NFBrentalName = checklistData.SelectedRetailTenant;
      var NFBSectionOneImage = checklistData.SectionOneImage;
      var NFBSectionOneImage2 = checklistData.SectionOneImage2;
      var NFBauditSubmissionDate = checklistData.created;
      var NFBSectionTwoImage = checklistData.SectionTwoImage;
      var NFBSectionTwoImage2 = checklistData.SectionTwoImage2;
      var NFBSectionThreeImage = checklistData.SectionThreeImage;
      var NFBSectionThreeImage2 = checklistData.SectionThreeImage2;
      res.render("pages/View-NFB", {
        customToken,
        sessionLogin,
        NFBSectionOneImage,
        NFBSectionTwoImage,
        NFBSectionThreeImage,
        NFBSectionOneImage2,
        NFBSectionTwoImage2,
        NFBSectionThreeImage2,
        dataID,
        NFBName,
        NFBinstituteName,
        NFBrentalName,
        NFBSectionOneTotal,
        NFBSectionTwoTotal,
        NFBSectionThreeTotal,
        NFBSectionOneRemarks,
        NFBSectionTwoRemarks,
        NFBSectionThreeRemarks,
        NFBauditSubmissionDate,
        NFBData,
      });
    })
    .catch((error) => {
      console.log("Error creating custom token:", error);

      sleep(600).then(() => {
        // Do something after the sleep!
        res.redirect("/View-NFB/" + dataID + "/" + sessionLogin);
      });

      console.log("redirecting");
    });
  function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  function getAllData(data) {
    console.log("Getting all data");
    var auditScores = data.val();
    checklistData = auditScores[dataID];
  }
});

app.get("/View-FB/:id/:email", (req, res) => {
  const dataID = req.params.id;
  const sessionLogin = req.params.email;
  var checklistData;
  const userId = dataID + sessionLogin;
  console.log(userId);

  const additionalClaims = {
    viewer: true,
  };
  console.log(additionalClaims);
  admin
    .auth()
    .createCustomToken(userId, additionalClaims)
    .then((customToken) => {
      // Send token back to client

      var ref = firebase
        .database()
        .ref("F&B-Checklist/" + sessionLogin + "/AuditAnswers");
      ref.on("value", getAllData);
      //console.log(checklistData);
      //var firebaseData = database.ref("F&B-Checklist/" + dataID);
      var FBData = Object.values(checklistData);

      var FBinstituteName = checklistData.SelectedInstituion;
      var FBName = checklistData.AuditFormName;
      var FBSectionOneTotal = checklistData.SectionOneTotal;
      var FBSectionTwoTotal = checklistData.SectionTwoTotal;
      var FBSectionThreeTotal = checklistData.SectionThreeTotal;
      var FBSectionFourTotal = checklistData.SectionFourTotal;
      var FBSectionFiveTotal = checklistData.SectionFiveTotal;
      var FBSectionOneImage = checklistData.SectionOneImage;
      var FBSectionTwoImage = checklistData.SectionTwoImage;
      var FBSectionThreeImage = checklistData.SectionThreeImage;
      var FBSectionFourImage = checklistData.SectionFourImage;
      var FBSectionFiveImage = checklistData.SectionFiveImage;
      var FBSectionOneImage2 = checklistData.SectionOneImage2;
      var FBSectionTwoImage2 = checklistData.SectionTwoImage2;
      var FBSectionThreeImage2 = checklistData.SectionThreeImage2;
      var FBSectionFourImage2 = checklistData.SectionFourImage2;
      var FBSectionFiveImage2 = checklistData.SectionFiveImage2;
      var FBSectionOneRemarks = checklistData.SectionOneRemarks;
      var FBSectionTwoRemarks = checklistData.SectionTwoRemarks;
      var FBSectionThreeRemarks = checklistData.ectionThreeRemark;
      var FBSectionFourRemarks = checklistData.SectionFourRemarks;
      var FBSectionFiveRemarks = checklistData.ectionFiveRemark;
      var FBrentalName = checklistData.SelectedRetailTenant;
      var FBauditSubmissionDate = checklistData.created;
      res.render("pages/View-FB", {
        customToken,
        FBSectionTwoImage,
        FBSectionTwoImage2,
        sessionLogin,
        FBSectionThreeImage,
        FBSectionFourImage,
        FBSectionFiveImage,
        FBSectionThreeImage2,
        FBSectionFourImage2,
        FBSectionFiveImage2,
        dataID,
        FBName,
        FBSectionOneImage,
        FBSectionOneImage2,
        FBinstituteName,
        FBrentalName,
        FBSectionOneTotal,
        FBSectionTwoTotal,
        FBSectionThreeTotal,
        FBSectionFourTotal,
        FBSectionFiveTotal,
        FBSectionOneRemarks,
        FBSectionTwoRemarks,
        FBSectionThreeRemarks,
        FBSectionFourRemarks,
        FBSectionFiveRemarks,
        FBauditSubmissionDate,
        FBData,
      });
    })
    .catch((error) => {
      console.log("Error creating custom token:", error);

      sleep(600).then(() => {
        // Do something after the sleep!
        res.redirect("/View-FB/" + dataID + "/" + sessionLogin);
      });

      console.log("redirecting");
    });
  function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  function getAllData(data) {
    console.log("Getting all data");
    var auditScores = data.val();
    checklistData = auditScores[dataID];
  }
});

app.get("/fullpage1-FB/:id", (req, res) => {
  const sessionCookie = req.cookies.session || "";
  var sessionLogin = req.cookies.loginEmail;
  sessionLogin = sessionLogin.split("@")[0];
  const dataID = req.params.id;
  var checklistData;

  var ref = firebase
    .database()
    .ref("F&B-Checklist/" + sessionLogin + "/AuditAnswers");
  ref.on("value", getAllData);
  //console.log(checklistData);
  //var firebaseData = database.ref("F&B-Checklist/" + dataID);
  var FBData = Object.values(checklistData);

  var FBinstituteName = checklistData.SelectedInstituion;
  var FBName = checklistData.AuditFormName;
  var FBSectionOneTotal = checklistData.SectionOneTotal;
  var FBSectionTwoTotal = checklistData.SectionTwoTotal;
  var FBSectionThreeTotal = checklistData.SectionThreeTotal;
  var FBSectionFourTotal = checklistData.SectionFourTotal;
  var FBSectionFiveTotal = checklistData.SectionFiveTotal;
  var FBSectionOneImage = checklistData.SectionOneImage;
  var FBSectionTwoImage = checklistData.SectionTwoImage;
  var FBSectionThreeImage = checklistData.SectionThreeImage;
  var FBSectionFourImage = checklistData.SectionFourImage;
  var FBSectionFiveImage = checklistData.SectionFiveImage;
  var FBSectionOneImage2 = checklistData.SectionOneImage2;
  var FBSectionTwoImage2 = checklistData.SectionTwoImage2;
  var FBSectionThreeImage2 = checklistData.SectionThreeImage2;
  var FBSectionFourImage2 = checklistData.SectionFourImage2;
  var FBSectionFiveImage2 = checklistData.SectionFiveImage2;

  var FBSectionOneRemarks = checklistData.SectionOneRemarks;
  var FBSectionTwoRemarks = checklistData.SectionTwoRemarks;
  var FBSectionThreeRemarks = checklistData.ectionThreeRemark;
  var FBSectionFourRemarks = checklistData.SectionFourRemarks;
  var FBSectionFiveRemarks = checklistData.ectionFiveRemark;
  var FBrentalName = checklistData.SelectedRetailTenant;
  var FBauditSubmissionDate = checklistData.created;

  res.render("pages/fullpage1-FB", {
    sessionLogin,
    FBSectionOneImage2,
    FBSectionFiveImage2,
    FBSectionFourImage2,
    FBSectionThreeImage2,
    FBSectionTwoImage2,
    dataID,
    FBName,
    FBSectionFiveImage,
    FBSectionFourImage,
    FBSectionThreeImage,
    FBSectionTwoImage,
    FBSectionOneImage,
    FBinstituteName,
    FBrentalName,
    FBSectionOneTotal,
    FBSectionTwoTotal,
    FBSectionThreeTotal,
    FBSectionFourTotal,
    FBSectionFiveTotal,
    FBSectionOneRemarks,
    FBSectionTwoRemarks,
    FBSectionThreeRemarks,
    FBSectionFourRemarks,
    FBSectionFiveRemarks,
    FBauditSubmissionDate,
    FBData,
  });

  clearAllFNBAuditData();
  function getAllData(data) {
    console.log("Getting all data");
    var auditScores = data.val();
    checklistData = auditScores[dataID];
  }
});
app.get("/getFBDataKey", (req, res) => {
  const sessionCookie = req.cookies.session || "";
  var sessionLogin = req.cookies.loginEmail;
  sessionLogin = sessionLogin.split("@")[0];
  var FBref = database.ref("F&B-Checklist/" + sessionLogin + "/AuditAnswers");
  FBref.on("value", getFBData, errData);

  function getFBData(data) {
    console.log("Getting f/b data");
    var auditScores = data.val();

    try {
      var keys = Object.keys(auditScores);
    } catch (error) {
      var keys = [];
    }

    var k = keys[keys.length - 1];
    FBDataKey = k;

    console.log(FBDataKey);
    admin
      .auth()
      .verifySessionCookie(sessionCookie, true)
      .then(() => {
        res.redirect("/fullpage1-FB/" + FBDataKey);
      })
      .catch((error) => {
        res.redirect("/login");
      });
  }

  function errData(err) {
    console.log("error!");
    console.log(err);
  }
});

app.get("/getNFBDataKey", (req, res) => {
  const sessionCookie = req.cookies.session || "";
  var sessionLogin = req.cookies.loginEmail;
  sessionLogin = sessionLogin.split("@")[0];
  var NFBref = database.ref(
    "Non-F&B-Checklist/" + sessionLogin + "/AuditAnswers"
  );
  NFBref.on("value", getNFBData, errData);

  function getNFBData(data) {
    console.log("Getting nf/b data");
    var auditScores = data.val();

    try {
      var keys = Object.keys(auditScores);
    } catch (error) {
      var keys = [];
    }

    var k = keys[keys.length - 1];
    NFBDataKey = k;
    // var ID = NFBDataKey[keys.length-1];
    console.log(NFBDataKey);
    admin
      .auth()
      .verifySessionCookie(sessionCookie, true)
      .then(() => {
        res.redirect("/fullpage1-NonFB/" + NFBDataKey);
      })
      .catch((error) => {
        res.redirect("/login");
      });
  }

  function errData(err) {
    console.log("error!");
    console.log(err);
  }
});
app.get("/Non-F&B-ChecklistSectionOne", async function (req, res) {
  //clearAllNonFNBAuditData
  var SectionOneNonFBProfessionalism = [];
  var SectionOneNonFBStaffHygiene = [];
  const sessionCookie = req.cookies.session || "";
  const sessionLogin = req.cookies.loginEmail;
  var convCheckListData = NonFNBsectionOneChecklistAns;

  SectionOneNonFBProfessionalism = await getCheckListQn(
    "Non-F&B-AuditQuestion",
    "SectionOne",
    "Professionalism"
  );
  SectionOneNonFBStaffHygiene = await getCheckListQn(
    "Non-F&B-AuditQuestion",
    "SectionOne",
    "Staff Hygiene"
  );

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then(() => {
      res.render("pages/NonF&BChecklistSectionOne", {
        SectionOneNonFBProfessionalism,
        SectionOneNonFBStaffHygiene,
        sessionLogin,
        convCheckListData,
      });
    })
    .catch((error) => {
      res.redirect("/login");
    });
});

app.get("/Non-F&B-ChecklistSectionTwo", async function (req, res) {
  var SectionTwoNonFBGEC = [];
  const sessionLogin = req.cookies.loginEmail;
  const sessionCookie = req.cookies.session || "";
  var convCheckListData = NonFNBsectionTwoChecklistAns;
  var totalQn = 0;
  if (Object.keys(NonFNBsectionOneChecklistAns).length > 8) {
    totalQn = Object.keys(NonFNBsectionOneChecklistAns).length - 8;
  }

  SectionTwoNonFBGEC = await getCheckListQn(
    "Non-F&B-AuditQuestion",
    "SectionTwo",
    "General Environment Cleanliness"
  );

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then(() => {
      res.render("pages/NonF&BChecklistSectionTwo", {
        SectionTwoNonFBGEC,
        sessionLogin,
        convCheckListData,
        totalQn,
      });
    })
    .catch((error) => {
      res.redirect("/login");
    });
});

app.post("/Non-F&B-ChecklistSectionTwo", async function (req, res) {
  NonFNBsectionOneChecklistAns = req.body.checklist;
  var SectionTwoNonFBGEC = [];
  const sessionLogin = req.cookies.loginEmail;
  const sessionCookie = req.cookies.session || "";
  var convCheckListData = NonFNBsectionTwoChecklistAns;
  var totalQn = Object.keys(NonFNBsectionOneChecklistAns).length - 8;

  SectionTwoNonFBGEC = await getCheckListQn(
    "Non-F&B-AuditQuestion",
    "SectionTwo",
    "General Environment Cleanliness"
  );
  admin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then(() => {
      res.render("pages/NonF&BChecklistSectionTwo", {
        SectionTwoNonFBGEC,
        sessionLogin,
        convCheckListData,
        totalQn,
      });
    })
    .catch((error) => {
      res.redirect("/login");
    });
});

app.get("/Non-F&B-ChecklistSectionThree", async function (req, res) {
  const sessionCookie = req.cookies.session || "";
  var SectionThreeNonFBGeneralSafety = [];
  var SectionThreeNonFBFireEmergencySafety = [];
  var SectionThreeNonFBElectricalSafety = [];
  const sessionLogin = req.cookies.loginEmail;
  var convCheckListData = NonFNBsectionThreeChecklistAns;
  var totalQn = 0;
  if (
    Object.keys(NonFNBsectionOneChecklistAns).length +
      Object.keys(NonFNBsectionTwoChecklistAns).length >
    13
  ) {
    totalQn =
      Object.keys(NonFNBsectionOneChecklistAns).length +
      Object.keys(NonFNBsectionTwoChecklistAns).length.length -
      13;
  }

  SectionThreeNonFBElectricalSafety = await getCheckListQn(
    "Non-F&B-AuditQuestion",
    "SectionThree",
    "Electrical Safety"
  );
  SectionThreeNonFBFireEmergencySafety = await getCheckListQn(
    "Non-F&B-AuditQuestion",
    "SectionThree",
    "Fire & Emergency Safety"
  );
  SectionThreeNonFBGeneralSafety = await getCheckListQn(
    "Non-F&B-AuditQuestion",
    "SectionThree",
    "General Safety"
  );

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then(() => {
      res.render("pages/NonF&BChecklistSectionThree", {
        SectionThreeNonFBGeneralSafety,
        SectionThreeNonFBFireEmergencySafety,
        SectionThreeNonFBElectricalSafety,
        sessionLogin,
        convCheckListData,
        totalQn,
      });
    })
    .catch((error) => {
      res.redirect("/login");
    });
});

app.post("/Non-F&B-ChecklistSectionThree", async function (req, res) {
  NonFNBsectionTwoChecklistAns = req.body.checklist;
  const sessionCookie = req.cookies.session || "";
  var SectionThreeNonFBGeneralSafety = [];
  var SectionThreeNonFBFireEmergencySafety = [];
  var SectionThreeNonFBElectricalSafety = [];
  const sessionLogin = req.cookies.loginEmail;
  var convCheckListData = NonFNBsectionThreeChecklistAns;
  var totalQn =
    Object.keys(NonFNBsectionOneChecklistAns).length +
    Object.keys(NonFNBsectionTwoChecklistAns).length -
    13;
  SectionThreeNonFBElectricalSafety = await getCheckListQn(
    "Non-F&B-AuditQuestion",
    "SectionThree",
    "Electrical Safety"
  );
  SectionThreeNonFBFireEmergencySafety = await getCheckListQn(
    "Non-F&B-AuditQuestion",
    "SectionThree",
    "Fire & Emergency Safety"
  );
  SectionThreeNonFBGeneralSafety = await getCheckListQn(
    "Non-F&B-AuditQuestion",
    "SectionThree",
    "General Safety"
  );

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then(() => {
      res.render("pages/NonF&BChecklistSectionThree", {
        SectionThreeNonFBGeneralSafety,
        SectionThreeNonFBFireEmergencySafety,
        SectionThreeNonFBElectricalSafety,
        sessionLogin,
        convCheckListData,
        totalQn,
      });
    })
    .catch((error) => {
      res.redirect("/login");
    });
});

// CREATE ROUTE
app.post("/Non-F&B-ChecklistSectionThreeSubmission", async function (req, res) {
  console.log("Loading Checklist post");
  var SectionOneNonFBProfessionalism = [];
  var SectionOneNonFBStaffHygiene = [];
  var SectionTwoNonFBGEC = [];
  var SectionThreeNonFBElectricalSafety = [];
  var SectionThreeNonFBFireEmergencySafety = [];
  var SectionThreeNonFBGeneralSafety = [];
  const sessionCookie = req.cookies.session || "";
  var sessionEmail = req.cookies.loginEmail;
  sessionEmail = sessionEmail.split("@")[0];
  localStorage.clear();
  //console.log("Session cookie is: " + sessionCookie);
  console.log("sessionEmail is: " + sessionEmail);
  SectionOneNonFBProfessionalism = await getCheckListQn(
    "Non-F&B-AuditQuestion",
    "SectionOne",
    "Professionalism"
  );
  SectionOneNonFBStaffHygiene = await getCheckListQn(
    "Non-F&B-AuditQuestion",
    "SectionOne",
    "Staff Hygiene"
  );
  SectionTwoNonFBGEC = await getCheckListQn(
    "Non-F&B-AuditQuestion",
    "SectionTwo",
    "General Environment Cleanliness"
  );
  SectionThreeNonFBElectricalSafety = await getCheckListQn(
    "Non-F&B-AuditQuestion",
    "SectionThree",
    "Electrical Safety"
  );
  SectionThreeNonFBFireEmergencySafety = await getCheckListQn(
    "Non-F&B-AuditQuestion",
    "SectionThree",
    "Fire & Emergency Safety"
  );
  SectionThreeNonFBGeneralSafety = await getCheckListQn(
    "Non-F&B-AuditQuestion",
    "SectionThree",
    "General Safety"
  );
  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(() => {
      // To remove any script tag in the body
      //req.body.checklist.body = req.sanitize(req.body.checklist.body);
      NonFNBsectionThreeChecklistAns = req.body.checklist;
      res.cookie(
        "sectionThreeAnswer",
        JSON.stringify(NonFNBsectionThreeChecklistAns)
      );
      NonFNBsectionThreeChecklistAns["created"] = Date(Date.now()).toString();
      let combChecklist = {
        ...NonFNBsectionOneChecklistAns,
        ...NonFNBsectionTwoChecklistAns,
        ...NonFNBsectionThreeChecklistAns,
      };

      var tag = ["Professionalism"];
      var combQnlist = tag.concat(
        SectionOneNonFBProfessionalism,
        "Staff Hygiene",
        SectionOneNonFBStaffHygiene,
        "General Environment Cleanliness",
        SectionTwoNonFBGEC,
        "General Safety",
        SectionThreeNonFBGeneralSafety,
        "Fire & Emergency Safety",
        SectionThreeNonFBFireEmergencySafety,
        "Electrical Safety",
        SectionThreeNonFBElectricalSafety,
        "End"
      );
      var ObjQnlist = Object.assign({}, combQnlist);
      database
        .ref("Non-F&B-Checklist/" + sessionEmail + "/AuditAnswers")
        .push()
        .set(combChecklist, function (err) {
          if (err) {
            console.log("Error Creating:" + error);
            res.render("new");
          } else {
            console.log("Create successful!");
            //console.log(newBlogKey);
            // newBlogRef.off();
            clearAllNonFNBAuditData();
          }
        });
      database
        .ref("Non-F&B-Checklist/" + sessionEmail + "/AuditQuestions")
        .push()
        .set(ObjQnlist, function (err) {
          if (err) {
            console.log("Error Creating:" + error);
            res.render("new");
          } else {
            console.log("Create successful!");
            clearAllNonFNBAuditData();

            res.redirect("/getNFBDataKey");
          }
        });
    })
    .catch((error) => {
      console.log(error);
      res.redirect("/login");
    });
});
app.post("/sendEmail", (req, res) => {
  console.log(req.body);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "sghaudit6@gmail.com",
      pass: "23Hvqw11",
    },
  });
  const mailOptions = {
    from: "sghaudit6@gmail.com",
    to: req.body.receiverEmail,
    subject: req.body.subject,
    text: req.body.message,
    html: req.body.html,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.send("error");
    } else {
      console.log("Email sent.");
      res.send("success");
    }
  });
});
app.get("/F&B-ChecklistSectionOne", async function (req, res) {
  const sessionCookie = req.cookies.session || "";
  var SectionOneFBProfessionalism = [];
  var SectionOneFBStaffHygiene = [];
  const sessionLogin = req.cookies.loginEmail;
  var convCheckListData = FNBsectionOneChecklistAns;

  SectionOneFBProfessionalism = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionOne",
    "Professionalism"
  );
  SectionOneFBStaffHygiene = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionOne",
    "Staff Hygiene"
  );

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then(() => {
      res.render("pages/F&BChecklistSectionOne", {
        SectionOneFBProfessionalism,
        SectionOneFBStaffHygiene,
        sessionLogin,
        convCheckListData,
      });
    })
    .catch((error) => {
      res.redirect("/login");
    });
});

app.get("/F&B-ChecklistSectionTwo", async function (req, res) {
  const sessionCookie = req.cookies.session || "";
  var SectionTwoFBGEC = [];
  var SectionTwoFBHHF = [];
  const sessionLogin = req.cookies.loginEmail;
  var convCheckListData = FNBsectionTwoChecklistAns;
  var totalQn = Object.keys(FNBsectionOneChecklistAns).length - 8;

  SectionTwoFBGEC = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionTwo",
    "General Environment Cleanliness"
  );
  SectionTwoFBHHF = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionTwo",
    "Hand Hygiene Facilities"
  );

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then(() => {
      res.render("pages/F&BChecklistSectionTwo", {
        SectionTwoFBGEC,
        SectionTwoFBHHF,
        sessionLogin,
        convCheckListData,
        totalQn,
      });
    })
    .catch((error) => {
      console.log(error);
      res.redirect("/login");
    });
});

app.post("/F&B-ChecklistSectionTwo", async function (req, res) {
  FNBsectionOneChecklistAns = req.body.checklist;
  const sessionCookie = req.cookies.session || "";
  var SectionTwoFBGEC = [];
  var SectionTwoFBHHF = [];
  const sessionLogin = req.cookies.loginEmail;
  var convCheckListData = FNBsectionTwoChecklistAns;
  var totalQn = Object.keys(FNBsectionOneChecklistAns).length - 8;

  SectionTwoFBGEC = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionTwo",
    "General Environment Cleanliness"
  );
  SectionTwoFBHHF = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionTwo",
    "Hand Hygiene Facilities"
  );

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then(() => {
      res.render("pages/F&BChecklistSectionTwo", {
        SectionTwoFBGEC,
        SectionTwoFBHHF,
        sessionLogin,
        convCheckListData,
        totalQn,
      });
    })
    .catch((error) => {
      console.log(error);
      res.redirect("/login");
    });
});

app.get("/F&B-ChecklistSectionThree", async function (req, res) {
  const sessionCookie = req.cookies.session || "";
  var SectionThreeFBStoragePrep = [];
  var SectionThreeFBStorageFridgeOrWarmer = [];
  const sessionLogin = req.cookies.loginEmail;
  var convCheckListData = FNBsectionThreeChecklistAns;
  var totalQn =
    Object.keys(FNBsectionOneChecklistAns).length +
    Object.keys(FNBsectionTwoChecklistAns).length -
    13;

  SectionThreeFBStoragePrep = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionThree",
    "Storage & Preparation of Food"
  );
  SectionThreeFBStorageFridgeOrWarmer = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionThree",
    "Storage of Food in Refrigerator or Warmer"
  );

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then(() => {
      res.render("pages/F&BChecklistSectionThree", {
        SectionThreeFBStoragePrep,
        SectionThreeFBStorageFridgeOrWarmer,
        sessionLogin,
        convCheckListData,
        totalQn,
      });
    })
    .catch((error) => {
      console.log(error);
      res.redirect("/login");
    });
});

app.post("/F&B-ChecklistSectionThree", async function (req, res) {
  FNBsectionTwoChecklistAns = req.body.checklist;
  const sessionCookie = req.cookies.session || "";
  var SectionThreeFBStoragePrep = [];
  var SectionThreeFBStorageFridgeOrWarmer = [];
  const sessionLogin = req.cookies.loginEmail;
  var convCheckListData = FNBsectionThreeChecklistAns;
  var totalQn =
    Object.keys(FNBsectionOneChecklistAns).length +
    Object.keys(FNBsectionTwoChecklistAns).length -
    13;

  SectionThreeFBStoragePrep = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionThree",
    "Storage & Preparation of Food"
  );
  SectionThreeFBStorageFridgeOrWarmer = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionThree",
    "Storage of Food in Refrigerator or Warmer"
  );

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then(() => {
      res.render("pages/F&BChecklistSectionThree", {
        SectionThreeFBStoragePrep,
        SectionThreeFBStorageFridgeOrWarmer,
        sessionLogin,
        convCheckListData,
        totalQn,
      });
    })
    .catch((error) => {
      console.log(error);
      res.redirect("/login");
    });
});

app.get("/F&B-ChecklistSectionFour", async function (req, res) {
  const sessionCookie = req.cookies.session || "";
  var SectionFourFBBeverage = [];
  var SectionFourFBFood = [];
  const sessionLogin = req.cookies.loginEmail;
  var convCheckListData = FNBsectionFourChecklistAns;
  var totalQn =
    Object.keys(FNBsectionOneChecklistAns).length +
    Object.keys(FNBsectionTwoChecklistAns).length +
    Object.keys(FNBsectionThreeChecklistAns).length -
    18;

  SectionFourFBBeverage = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionFour",
    "Beverage"
  );
  SectionFourFBFood = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionFour",
    "Food"
  );

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then(() => {
      res.render("pages/F&BChecklistSectionFour", {
        SectionFourFBBeverage,
        SectionFourFBFood,
        sessionLogin,
        convCheckListData,
        totalQn,
      });
    })
    .catch((error) => {
      console.log(error);
      res.redirect("/login");
    });
});

app.post("/F&B-ChecklistSectionFour", async function (req, res) {
  FNBsectionThreeChecklistAns = req.body.checklist;
  const sessionCookie = req.cookies.session || "";
  var SectionFourFBBeverage = [];
  var SectionFourFBFood = [];
  const sessionLogin = req.cookies.loginEmail;
  var convCheckListData = FNBsectionFourChecklistAns;
  var totalQn =
    Object.keys(FNBsectionOneChecklistAns).length +
    Object.keys(FNBsectionTwoChecklistAns).length +
    Object.keys(FNBsectionThreeChecklistAns).length -
    18;

  SectionFourFBBeverage = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionFour",
    "Beverage"
  );
  SectionFourFBFood = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionFour",
    "Food"
  );

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then(() => {
      res.render("pages/F&BChecklistSectionFour", {
        SectionFourFBBeverage,
        SectionFourFBFood,
        sessionLogin,
        convCheckListData,
        totalQn,
      });
    })
    .catch((error) => {
      console.log(error);
      res.redirect("/login");
    });
});

app.get("/F&B-ChecklistSectionFive", async function (req, res) {
  const sessionCookie = req.cookies.session || "";
  var SectionFiveFBElectricalSafety = [];
  var SectionFiveFBFireSafety = [];
  var SectionFiveFBGeneralSafety = [];
  const sessionLogin = req.cookies.loginEmail;
  var convCheckListData = FNBsectionFiveChecklistAns;
  var totalQn =
    Object.keys(FNBsectionOneChecklistAns).length +
    Object.keys(FNBsectionTwoChecklistAns).length +
    Object.keys(FNBsectionThreeChecklistAns).length +
    Object.keys(FNBsectionFourChecklistAns).length -
    23;

  SectionFiveFBElectricalSafety = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionFive",
    "Electrical Safety"
  );
  SectionFiveFBFireSafety = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionFive",
    "Fire & Emergency Safety"
  );
  SectionFiveFBGeneralSafety = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionFive",
    "General Safety"
  );

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then(() => {
      res.render("pages/F&BChecklistSectionFive", {
        SectionFiveFBElectricalSafety,
        SectionFiveFBFireSafety,
        SectionFiveFBGeneralSafety,
        sessionLogin,
        convCheckListData,
        totalQn,
      });
    })
    .catch((error) => {
      console.log(error);
      res.redirect("/login");
    });
});

app.post("/F&B-ChecklistSectionFive", async function (req, res) {
  FNBsectionFourChecklistAns = req.body.checklist;
  const sessionCookie = req.cookies.session || "";
  var SectionFiveFBElectricalSafety = [];
  var SectionFiveFBFireSafety = [];
  var SectionFiveFBGeneralSafety = [];
  const sessionLogin = req.cookies.loginEmail;
  var convCheckListData = FNBsectionFiveChecklistAns;
  var totalQn =
    Object.keys(FNBsectionOneChecklistAns).length +
    Object.keys(FNBsectionTwoChecklistAns).length +
    Object.keys(FNBsectionThreeChecklistAns).length +
    Object.keys(FNBsectionFourChecklistAns).length -
    23;

  SectionFiveFBElectricalSafety = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionFive",
    "Electrical Safety"
  );
  SectionFiveFBFireSafety = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionFive",
    "Fire & Emergency Safety"
  );
  SectionFiveFBGeneralSafety = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionFive",
    "General Safety"
  );

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then(() => {
      res.render("pages/F&BChecklistSectionFive", {
        SectionFiveFBElectricalSafety,
        SectionFiveFBFireSafety,
        SectionFiveFBGeneralSafety,
        sessionLogin,
        convCheckListData,
        totalQn,
      });
    })
    .catch((error) => {
      console.log(error);
      res.redirect("/login");
    });
});

// CREATE ROUTE
app.post("/F&B-ChecklistSectionFiveSubmission", async function (req, res) {
  var SectionOneFBProfessionalism = [];
  var SectionOneFBStaffHygiene = [];
  var SectionTwoFBGEC = [];
  var SectionTwoFBHHF = [];
  var SectionThreeFBStoragePrep = [];
  var SectionThreeFBStorageFridgeOrWarmer = [];
  var SectionFourFBBeverage = [];
  var SectionFourFBFood = [];
  var SectionFiveFBElectricalSafety = [];
  var SectionFiveFBFireSafety = [];
  var SectionFiveFBGeneralSafety = [];
  localStorage.clear();

  console.log("Loading Checklist post");
  const sessionCookie = req.cookies.session || "";
  var sessionEmail = req.cookies.loginEmail;
  sessionEmail = sessionEmail.split("@")[0];
  //console.log("Session cookie is: " + sessionCookie);

  SectionOneFBProfessionalism = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionOne",
    "Professionalism"
  );
  SectionOneFBStaffHygiene = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionOne",
    "Staff Hygiene"
  );
  SectionTwoFBGEC = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionTwo",
    "General Environment Cleanliness"
  );
  SectionTwoFBHHF = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionTwo",
    "Hand Hygiene Facilities"
  );
  SectionThreeFBStoragePrep = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionThree",
    "Storage & Preparation of Food"
  );
  SectionThreeFBStorageFridgeOrWarmer = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionThree",
    "Storage of Food in Refrigerator or Warmer"
  );
  SectionFourFBBeverage = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionFour",
    "Beverage"
  );
  SectionFourFBFood = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionFour",
    "Food"
  );
  SectionFiveFBElectricalSafety = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionFive",
    "Electrical Safety"
  );
  SectionFiveFBFireSafety = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionFive",
    "Fire & Emergency Safety"
  );
  SectionFiveFBGeneralSafety = await getCheckListQn(
    "F&B-AuditQuestion",
    "SectionFive",
    "General Safety"
  );

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(() => {
      // To remove any script tag in the body
      //req.body.checklist.body = req.sanitize(req.body.checklist.body);
      FNBsectionFiveChecklistAns = req.body.checklist;
      FNBsectionFiveChecklistAns["created"] = Date(Date.now()).toString();
      let combChecklist = {
        ...FNBsectionOneChecklistAns,
        ...FNBsectionTwoChecklistAns,
        ...FNBsectionThreeChecklistAns,
        ...FNBsectionFourChecklistAns,
        ...FNBsectionFiveChecklistAns,
      };

      var tag = ["Professionalism"];
      var combQnlist = tag.concat(
        SectionOneFBProfessionalism,
        "Staff Hygiene",
        SectionOneFBStaffHygiene,
        "General Environment Cleanliness",
        SectionTwoFBGEC,
        "Hand Hygiene Facilities",
        SectionTwoFBHHF,
        "Storage & Preparation of Food",
        SectionThreeFBStoragePrep,
        "Storage of Food in Refrigerator or Warmer",
        SectionThreeFBStorageFridgeOrWarmer,
        "Food",
        SectionFourFBFood,
        "Beverage",
        SectionFourFBBeverage,
        "General Safety",
        SectionFiveFBGeneralSafety,
        "Fire & Emergency Safety",
        SectionFiveFBFireSafety,
        "Electrical Safety",
        SectionFiveFBElectricalSafety,
        "End"
      );
      //console.log(combChecklist);
      //console.log(checkListQn);

      var ObjQnlist = Object.assign({}, combQnlist);
      database
        .ref("F&B-Checklist/" + sessionEmail + "/AuditAnswers")
        .push()
        .set(combChecklist, function (err) {
          if (err) {
            console.log("Error Creating:" + error);
            res.render("new");
          } else {
            console.log("Create successful!");
            //console.log(newBlogKey);
            // newBlogRef.off();
            clearAllNonFNBAuditData();
          }
        });

      database
        .ref("F&B-Checklist/" + sessionEmail + "/AuditQuestions")
        .push()
        .set(ObjQnlist, function (err) {
          if (err) {
            console.log("Error Creating:" + error);
            res.render("new");
          } else {
            console.log("Create successful!");
            //console.log(newBlogKey);
            // newBlogRef.off();
            clearAllFNBAuditData();
            res.redirect("/getFBDataKey");
          }
        });
    })
    .catch((error) => {
      res.redirect("/login");
    });
});

app.get("/", function (req, res) {
  res.render("index.html");
});

app.post("/sessionLogin", (req, res) => {
  const idToken = req.body.idToken.toString();
  var emailAddress = req.body.login.toString();
  var loginPassword = req.body.password.toString();
  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  admin
    .auth()
    .createSessionCookie(idToken, { expiresIn })
    .then(
      (sessionCookie) => {
        const options = { maxAge: expiresIn, httpOnly: true };
        res.cookie("session", sessionCookie, options);
        res.cookie("loginEmail", emailAddress, options);
        res.end(JSON.stringify({ status: "success" }));
      },
      (error) => {
        res.status(401).send("UNAUTHORIZED REQUEST!");
      }
    );

  firebase
    .auth()
    .signInWithEmailAndPassword(emailAddress, loginPassword)
    .then((userCredential) => {
      // Signed in
      console.log("logged in");
      var user = userCredential.user;
      // ...
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
    });
});

app.post("/AccountCreated", (req, res) => {
  const idToken = req.body.idToken.toString();
  var emailAddress = req.body.email.toString();
  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  admin
    .auth()
    .createSessionCookie(idToken, { expiresIn })
    .then(
      (sessionCookie) => {
        const options = { maxAge: expiresIn, httpOnly: true };
        res.end(JSON.stringify({ status: "success" }));
      },
      (error) => {
        res.status(401).send("UNAUTHORIZED REQUEST!");
      }
    );
  console.log("Updating database");
  database
    .ref("SingHealthAcc/")
    .push()
    .set({ Email: emailAddress }, function (err) {
      if (err) {
        console.log("Error Creating:" + error);
        res.render("new");
      } else {
        console.log("Create successful!");
      }
    });
});

app.get("/DeleteUser/:email", async function (req, res) {
  var userEmail = req.params.email;
  var uid = await getUidFromEmail(userEmail);
  var emailKey = await getKeyFromRegisteredEmail(userEmail);
  var deleteUser = await deleteUserAccount(emailKey, uid, userEmail);
  res.redirect("/RegisteredAccounts");
});

async function getUidFromEmail(email) {
  var uidResult;
  let promise = new Promise((resolve, reject) => {
    admin
      .auth()
      .getUserByEmail(email)
      .then(function (userRecord) {
        // See the UserRecord reference doc for the contents of userRecord.
        uidResult = userRecord.uid;
        resolve();
        //console.log("Successfully fetched user data:", userRecord.toJSON());
      })
      .catch(function (error) {
        console.log("Error fetching user data:", error);
        reject();
      });
  });
  let result = await promise;
  return uidResult;
}

async function deleteUserAccount(emailKey, uid, email) {
  var emailKey;
  var n = email.indexOf("@");
  email = email.substring(0, n != -1 ? n : s.length);
  let promise = new Promise((resolve, reject) => {
    admin
      .auth()
      .deleteUser(uid)
      .then(() => {
        console.log("Successfully deleted user");
        //Delete data from database
        firebase
          .database()
          .ref("SingHealthAcc/" + emailKey)
          .remove();
        firebase
          .database()
          .ref("F&B-Checklist/" + email)
          .remove();
        firebase
          .database()
          .ref("Non-F&B-Checklist/" + email)
          .remove();
        resolve();
      })
      .catch((error) => {
        console.log("Error deleting user:", error);
        reject();
      });
  });
  let result = await promise;
  return 1;
}

app.get("/F&B-History", async function (req, res) {
  const sessionCookie = req.cookies.session || "";
  var sessionLogin = req.cookies.loginEmail;
  sessionLogin = sessionLogin.split("@")[0];
  await getAllHistoryData(sessionLogin);

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then(() => {
      res.render("pages/History", {
        NFBinstituteName,
        NFBrentalName,
        NFBauditSubmissionDate,
        NFBDataKey,
        FBinstituteName,
        FBrentalName,
        FBauditSubmissionDate,
        FBDataKey,
      });
    })
    .catch((error) => {
      console.log(error);
      res.redirect("/login");
    });
});

async function getAllHistoryData(sessionLogin) {
  //Clear all data
  FBinstituteName = [];
  FBrentalName = [];
  FBauditSubmissionDate = [];
  FBDataKey = [];
  NFBinstituteName = [];
  NFBrentalName = [];
  NFBauditSubmissionDate = [];
  NFBDataKey = [];
  var NonFBDir = "Non-F&B-Checklist/" + sessionLogin + "/AuditAnswers";
  var FBDir = "F&B-Checklist/" + sessionLogin + "/AuditAnswers";

  let promise = new Promise((resolve, reject) => {
    var query = firebase.database().ref(NonFBDir).orderByKey();
    query.on("value", function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var childData = childSnapshot.val();
        NFBinstituteName.push(childData.SelectedInstituion);
        NFBrentalName.push(childData.SelectedRetailTenant);
        NFBauditSubmissionDate.push(childData.created);
        NFBDataKey.push(childSnapshot.key);
      });
      resolve();
    });
  });
  let result = await promise;

  let promise2 = new Promise((resolve, reject) => {
    var query = firebase.database().ref(FBDir).orderByKey();
    query.on("value", function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var childData = childSnapshot.val();
        FBinstituteName.push(childData.SelectedInstituion);
        FBrentalName.push(childData.SelectedRetailTenant);
        FBauditSubmissionDate.push(childData.created);
        FBDataKey.push(childSnapshot.key);
      });
      resolve();
    });
  });
  let result2 = await promise2;
}

app.get("/editF&BAuditFormsSectionOne/:id", async function (req, res) {
  clearAllFNBAuditData();
  const sessionCookie = req.cookies.session || "";
  var sessionLogin = req.cookies.loginEmail;
  sessionLogin = sessionLogin.split("@")[0];
  const dataID = req.params.id;
  var SectionOneFBProfessionalism = [];
  var SectionOneFBStaffHygiene = [];

  var ref = firebase
    .database()
    .ref("F&B-Checklist/" + sessionLogin + "/AuditAnswers");
  ref.on("value", getAnswerData);
  //Load Qn and store in global variable
  FNBChecklistQuestions = await getQuestionFromAnswerKey(
    true,
    sessionLogin,
    dataID
  );
  SectionOneFBProfessionalism = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Professionalism"
  );

  SectionOneFBStaffHygiene = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Staff Hygiene"
  );
  //console.log(checklistData);
  //var firebaseData = database.ref("F&B-Checklist/" + dataID);
  admin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then(() => {
      setTimeout(function () {
        delete checklistData.created;
        delete checklistData.sessionEmail;
        var convCheckListData = checklistData;
        var FBSectionOneImage = checklistData.SectionOneImage;
        var FBSectionOneImage2 = checklistData.SectionOneImage2;
        res.render("pages/editF&BChecklistSectionOne", {
          sessionLogin,
          dataID,
          convCheckListData,
          SectionOneFBProfessionalism,
          SectionOneFBStaffHygiene,
          FBSectionOneImage,
          FBSectionOneImage2,
        });
      }, 300);
    })
    .catch((error) => {
      res.redirect("/login");
    });
  function getAnswerData(data) {
    //console.log("Getting all data");
    var auditScores = data.val();
    checklistData = auditScores[dataID];
  }
});

app.get("/editF&BAuditFormsSectionTwo/:id", async function (req, res) {
  const sessionCookie = req.cookies.session || "";
  var sessionLogin = req.cookies.loginEmail;
  sessionLogin = sessionLogin.split("@")[0];
  const dataID = req.params.id;
  var SectionTwoFBGEC = [];
  var SectionTwoFBHHF = [];
  var a = [];
  var b = [];

  var totalQn;
  var ref = firebase
    .database()
    .ref("F&B-Checklist/" + sessionLogin + "/AuditAnswers");
  ref.on("value", getAnswerData);
  //Load Qn and store in global variable
  SectionTwoFBGEC = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "General Environment Cleanliness"
  );

  SectionTwoFBHHF = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Hand Hygiene Facilities"
  );

  a = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Professionalism"
  );

  b = await sectionaliseQuestions(FNBChecklistQuestions, true, "Staff Hygiene");

  totalQn = a.length + b.length;
  //console.log(checklistData);
  //var firebaseData = database.ref("F&B-Checklist/" + dataID);

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then(() => {
      setTimeout(function () {
        delete checklistData.created;
        delete checklistData.sessionEmail;
        var convCheckListData = FNBsectionTwoChecklistAns;
        //  console.log(convCheckListData);
        var FBSectionTwoImage = checklistData.SectionTwoImage;
        var FBSectionTwoImage2 = checklistData.SectionTwoImage2;
        res.render("pages/editF&BChecklistSectionTwo", {
          sessionLogin,
          dataID,
          FBSectionTwoImage,
          FBSectionTwoImage2,
          convCheckListData,
          SectionTwoFBGEC,
          SectionTwoFBHHF,
          totalQn,
        });
      }, 300);
    })
    .catch((error) => {
      res.redirect("/login");
    });

  function getAnswerData(data) {
    //console.log("Getting all data");
    var auditScores = data.val();
    checklistData = auditScores[dataID];
  }
});

app.post("/editF&BAuditFormsSectionTwo/:id", async function (req, res) {
  FNBsectionOneChecklistAns = req.body.checklist;
  const sessionCookie = req.cookies.session || "";
  var sessionLogin = req.cookies.loginEmail;
  sessionLogin = sessionLogin.split("@")[0];
  const dataID = req.params.id;
  var SectionTwoFBGEC = [];
  var SectionTwoFBHHF = [];
  var a = [];
  var b = [];

  var totalQn;
  var ref = firebase
    .database()
    .ref("F&B-Checklist/" + sessionLogin + "/AuditAnswers");
  ref.on("value", getAnswerData);
  //Load Qn and store in global variable
  SectionTwoFBGEC = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "General Environment Cleanliness"
  );

  SectionTwoFBHHF = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Hand Hygiene Facilities"
  );

  a = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Professionalism"
  );

  b = await sectionaliseQuestions(FNBChecklistQuestions, true, "Staff Hygiene");

  totalQn = a.length + b.length;
  //console.log(checklistData);
  //var firebaseData = database.ref("F&B-Checklist/" + dataID);

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then(() => {
      setTimeout(function () {
        delete checklistData.created;
        delete checklistData.sessionEmail;
        var convCheckListData = checklistData;
        var FBSectionTwoImage = checklistData.SectionTwoImage;
        var FBSectionTwoImage2 = checklistData.SectionTwoImage2;
        res.render("pages/editF&BChecklistSectionTwo", {
          sessionLogin,
          FBSectionTwoImage,
          FBSectionTwoImage2,
          dataID,
          convCheckListData,
          SectionTwoFBGEC,
          SectionTwoFBHHF,
          totalQn,
        });
      }, 300);
    })
    .catch((error) => {
      res.redirect("/login");
    });

  function getAnswerData(data) {
    //console.log("Getting all data");
    var auditScores = data.val();
    checklistData = auditScores[dataID];
  }
});

app.get("/editF&BAuditFormsSectionThree/:id", async function (req, res) {
  const sessionCookie = req.cookies.session || "";
  var sessionLogin = req.cookies.loginEmail;
  sessionLogin = sessionLogin.split("@")[0];
  const dataID = req.params.id;
  var SectionThreeFBStoragePrep = [];
  var SectionThreeFBStorageFridgeOrWarmer = [];

  var a = [];
  var b = [];
  var c = [];
  var d = [];

  var totalQn;
  var ref = firebase
    .database()
    .ref("F&B-Checklist/" + sessionLogin + "/AuditAnswers");
  ref.on("value", getAnswerData);
  //Load Qn and store in global variable
  SectionThreeFBStoragePrep = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Storage & Preparation of Food"
  );

  SectionThreeFBStorageFridgeOrWarmer = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Storage of Food in Refrigerator or Warmer"
  );

  a = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Professionalism"
  );

  b = await sectionaliseQuestions(FNBChecklistQuestions, true, "Staff Hygiene");

  c = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "General Environment Cleanliness"
  );

  d = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Hand Hygiene Facilities"
  );

  totalQn = a.length + b.length + c.length + d.length;
  //console.log(checklistData);
  //var firebaseData = database.ref("F&B-Checklist/" + dataID);

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then(() => {
      setTimeout(function () {
        delete checklistData.created;
        delete checklistData.sessionEmail;
        var convCheckListData = FNBsectionThreeChecklistAns;
        var FBSectionThreeImage = checklistData.SectionThreeImage;
        var FBSectionThreeImage2 = checklistData.SectionThreeImage2;
        res.render("pages/editF&BChecklistSectionThree", {
          sessionLogin,
          dataID,
          convCheckListData,
          FBSectionThreeImage,
          FBSectionThreeImage2,
          SectionThreeFBStoragePrep,
          SectionThreeFBStorageFridgeOrWarmer,
          totalQn,
        });
      }, 300);
    })
    .catch((error) => {
      res.redirect("/login");
    });

  function getAnswerData(data) {
    //console.log("Getting all data");
    var auditScores = data.val();
    checklistData = auditScores[dataID];
  }
});

app.post("/editF&BAuditFormsSectionThree/:id", async function (req, res) {
  FNBsectionTwoChecklistAns = req.body.checklist;
  const sessionCookie = req.cookies.session || "";
  var sessionLogin = req.cookies.loginEmail;
  sessionLogin = sessionLogin.split("@")[0];
  const dataID = req.params.id;
  var SectionThreeFBStoragePrep = [];
  var SectionThreeFBStorageFridgeOrWarmer = [];

  var a = [];
  var b = [];
  var c = [];
  var d = [];

  var totalQn;
  var ref = firebase
    .database()
    .ref("F&B-Checklist/" + sessionLogin + "/AuditAnswers");
  ref.on("value", getAnswerData);
  //Load Qn and store in global variable
  SectionThreeFBStoragePrep = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Storage & Preparation of Food"
  );

  SectionThreeFBStorageFridgeOrWarmer = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Storage of Food in Refrigerator or Warmer"
  );

  a = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Professionalism"
  );

  b = await sectionaliseQuestions(FNBChecklistQuestions, true, "Staff Hygiene");

  c = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "General Environment Cleanliness"
  );

  d = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Hand Hygiene Facilities"
  );

  totalQn = a.length + b.length + c.length + d.length;
  //console.log(checklistData);
  //var firebaseData = database.ref("F&B-Checklist/" + dataID);

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then(() => {
      setTimeout(function () {
        delete checklistData.created;
        delete checklistData.sessionEmail;
        var convCheckListData = checklistData;
        var FBSectionThreeImage = checklistData.SectionThreeImage;
        var FBSectionThreeImage2 = checklistData.SectionThreeImage2;
        res.render("pages/editF&BChecklistSectionThree", {
          sessionLogin,
          dataID,
          FBSectionThreeImage,
          FBSectionThreeImage2,
          convCheckListData,
          SectionThreeFBStoragePrep,
          SectionThreeFBStorageFridgeOrWarmer,
          totalQn,
        });
      }, 300);
    })
    .catch((error) => {
      res.redirect("/login");
    });

  function getAnswerData(data) {
    //console.log("Getting all data");
    var auditScores = data.val();
    checklistData = auditScores[dataID];
  }
});

app.get("/editF&BAuditFormsSectionFour/:id", async function (req, res) {
  const sessionCookie = req.cookies.session || "";
  var sessionLogin = req.cookies.loginEmail;
  sessionLogin = sessionLogin.split("@")[0];
  const dataID = req.params.id;
  var SectionFourFBBeverage = [];
  var SectionFourFBFood = [];

  var a = [];
  var b = [];
  var c = [];
  var d = [];
  var e = [];
  var f = [];

  var totalQn;
  var ref = firebase
    .database()
    .ref("F&B-Checklist/" + sessionLogin + "/AuditAnswers");
  ref.on("value", getAnswerData);
  //Load Qn and store in global variable
  SectionFourFBFood = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Food"
  );

  SectionFourFBBeverage = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Beverage"
  );

  a = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Professionalism"
  );

  b = await sectionaliseQuestions(FNBChecklistQuestions, true, "Staff Hygiene");

  c = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "General Environment Cleanliness"
  );

  d = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Hand Hygiene Facilities"
  );

  e = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Storage & Preparation of Food"
  );

  f = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Storage of Food in Refrigerator or Warmer"
  );

  totalQn = a.length + b.length + c.length + d.length + e.length + f.length;
  //console.log(checklistData);
  //var firebaseData = database.ref("F&B-Checklist/" + dataID);

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then(() => {
      setTimeout(function () {
        delete checklistData.created;
        delete checklistData.sessionEmail;
        var convCheckListData = FNBsectionFourChecklistAns;
        var FBSectionFourImage = checklistData.SectionFourImage;
        var FBSectionFourImage2 = checklistData.SectionFourImage2;
        res.render("pages/editF&BChecklistSectionFour", {
          sessionLogin,
          dataID,
          convCheckListData,
          FBSectionFourImage,
          FBSectionFourImage2,
          SectionFourFBFood,
          SectionFourFBBeverage,
          totalQn,
        });
      }, 300);
    })
    .catch((error) => {
      res.redirect("/login");
    });

  function getAnswerData(data) {
    //console.log("Getting all data");
    var auditScores = data.val();
    checklistData = auditScores[dataID];
  }
});

app.post("/editF&BAuditFormsSectionFour/:id", async function (req, res) {
  FNBsectionThreeChecklistAns = req.body.checklist;
  const sessionCookie = req.cookies.session || "";
  var sessionLogin = req.cookies.loginEmail;
  sessionLogin = sessionLogin.split("@")[0];
  const dataID = req.params.id;
  var SectionFourFBBeverage = [];
  var SectionFourFBFood = [];

  var a = [];
  var b = [];
  var c = [];
  var d = [];
  var e = [];
  var f = [];

  var totalQn;
  var ref = firebase
    .database()
    .ref("F&B-Checklist/" + sessionLogin + "/AuditAnswers");
  ref.on("value", getAnswerData);
  //Load Qn and store in global variable
  SectionFourFBFood = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Food"
  );

  SectionFourFBBeverage = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Beverage"
  );

  a = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Professionalism"
  );

  b = await sectionaliseQuestions(FNBChecklistQuestions, true, "Staff Hygiene");

  c = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "General Environment Cleanliness"
  );

  d = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Hand Hygiene Facilities"
  );

  e = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Storage & Preparation of Food"
  );

  f = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Storage of Food in Refrigerator or Warmer"
  );

  totalQn = a.length + b.length + c.length + d.length + e.length + f.length;
  //console.log(checklistData);
  //var firebaseData = database.ref("F&B-Checklist/" + dataID);

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then(() => {
      setTimeout(function () {
        delete checklistData.created;
        delete checklistData.sessionEmail;
        var convCheckListData = checklistData;
        var FBSectionFourImage = checklistData.SectionFourImage;
        var FBSectionFourImage2 = checklistData.SectionFourImage2;
        res.render("pages/editF&BChecklistSectionFour", {
          sessionLogin,
          dataID,
          FBSectionFourImage,
          FBSectionFourImage2,
          convCheckListData,
          SectionFourFBFood,
          SectionFourFBBeverage,
          totalQn,
        });
      }, 300);
    })
    .catch((error) => {
      res.redirect("/login");
    });

  function getAnswerData(data) {
    //console.log("Getting all data");
    var auditScores = data.val();
    checklistData = auditScores[dataID];
  }
});

app.post("/editF&BAuditFormsSectionFive/:id", async function (req, res) {
  FNBsectionFourChecklistAns = req.body.checklist;
  const sessionCookie = req.cookies.session || "";
  var sessionLogin = req.cookies.loginEmail;
  sessionLogin = sessionLogin.split("@")[0];
  const dataID = req.params.id;
  var SectionFiveFBElectricalSafety = [];
  var SectionFiveFBFireSafety = [];
  var SectionFiveFBGeneralSafety = [];

  var a = [];
  var b = [];
  var c = [];
  var d = [];
  var e = [];
  var f = [];
  var g = [];
  var h = [];

  var totalQn;
  var ref = firebase
    .database()
    .ref("F&B-Checklist/" + sessionLogin + "/AuditAnswers");
  ref.on("value", getAnswerData);
  //Load Qn and store in global variable
  SectionFiveFBGeneralSafety = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "General Safety"
  );

  SectionFiveFBFireSafety = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Fire & Emergency Safety"
  );

  SectionFiveFBElectricalSafety = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Electrical Safety"
  );

  a = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Professionalism"
  );

  b = await sectionaliseQuestions(FNBChecklistQuestions, true, "Staff Hygiene");

  c = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "General Environment Cleanliness"
  );

  d = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Hand Hygiene Facilities"
  );

  e = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Storage & Preparation of Food"
  );

  f = await sectionaliseQuestions(
    FNBChecklistQuestions,
    true,
    "Storage of Food in Refrigerator or Warmer"
  );

  g = await sectionaliseQuestions(FNBChecklistQuestions, true, "Food");

  h = await sectionaliseQuestions(FNBChecklistQuestions, true, "Beverage");

  totalQn =
    a.length +
    b.length +
    c.length +
    d.length +
    e.length +
    f.length +
    g.length +
    h.length;
  //console.log(checklistData);
  //var firebaseData = database.ref("F&B-Checklist/" + dataID);

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then(() => {
      setTimeout(function () {
        delete checklistData.created;
        delete checklistData.sessionEmail;
        var convCheckListData = checklistData;
        var FBSectionFiveImage = checklistData.SectionFiveImage;
        var FBSectionFiveImage2 = checklistData.SectionFiveImage2;

        res.render("pages/editF&BChecklistSectionFive", {
          sessionLogin,
          dataID,
          convCheckListData,
          FBSectionFiveImage,
          FBSectionFiveImage2,
          SectionFiveFBGeneralSafety,
          SectionFiveFBFireSafety,
          SectionFiveFBElectricalSafety,
          totalQn,
        });
      }, 300);
    })
    .catch((error) => {
      res.redirect("/login");
    });

  function getAnswerData(data) {
    //console.log("Getting all data");
    var auditScores = data.val();
    checklistData = auditScores[dataID];
  }
});

app.post("/editF&BAuditFormsSubmission/:id", async function (req, res) {
  console.log("Loading Checklist post");
  FNBsectionFiveChecklistAns = req.body.checklist;
  const sessionCookie = req.cookies.session || "";
  var sessionEmail = req.cookies.loginEmail;
  var dataID = req.params.id;
  sessionEmail = sessionEmail.split("@")[0];
  let combChecklist = {
    ...FNBsectionOneChecklistAns,
    ...FNBsectionTwoChecklistAns,
    ...FNBsectionThreeChecklistAns,
    ...FNBsectionFourChecklistAns,
    ...FNBsectionFiveChecklistAns,
  };
  //console.log("Session cookie is: " + sessionCookie);

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(() => {
      // To remove any script tag in the body
      //req.body.checklist.body = req.sanitize(req.body.checklist.body);
      // console.log(combChecklist);
      //console.log(checkListQn);

      database
        .ref("F&B-Checklist/" + sessionEmail + "/" + "AuditAnswers/" + dataID)
        .update(combChecklist, function (err) {
          if (err) {
            console.log("Error Creating:" + error);
            res.render("new");
          } else {
            console.log("Create successful!");
            //console.log(newBlogKey);
            // newBlogRef.off();
            res.redirect("/fullpage1-FB/" + dataID);
          }
        });
    })
    .catch((error) => {
      console.log(error);
      res.redirect("/login");
    });
});

async function getQuestionFromAnswerKey(FNB, user, Key) {
  var questions;
  var AnswerDir;
  var QuestionDir;
  var counterIndex = 0;
  var AnswerIndexCount = 0;
  let promise = new Promise((resolve, reject) => {
    if (FNB == false) {
      AnswerDir = "/Non-F&B-Checklist";
      QuestionDir = "/Non-F&B-Checklist";
    } else {
      AnswerDir = "/F&B-Checklist";
      QuestionDir = "/F&B-Checklist";
    }
    AnswerDir += "/" + user + "/AuditAnswers";
    QuestionDir += "/" + user + "/AuditQuestions";
    //Get key index of answer first
    var query = firebase.database().ref(AnswerDir).orderByKey();
    query.on("value", function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        if (Key == childSnapshot.key) {
          AnswerIndexCount = counterIndex;
          resolve();
        } else {
          counterIndex += 1;
        }
      });
    });
  });
  let result = await promise;

  let promise2 = new Promise((resolve, reject) => {
    //Get Answer with respective index
    var QuestionIndexCount = 0;
    var query2 = firebase.database().ref(QuestionDir).orderByKey();
    query2.on("value", function (snapshot2) {
      snapshot2.forEach(function (childSnapshot2) {
        //console.log("Question Database Key: " + childSnapshot2.key);
        if (AnswerIndexCount == QuestionIndexCount) {
          questions = childSnapshot2.val();
          resolve();
        }
        //Increment Index
        QuestionIndexCount += 1;
      });
    });
  });
  let result2 = await promise2;
  return questions;
}

async function sectionaliseQuestions(questions, FNB, Section) {
  var sectionalisedQns = [];
  let promise = new Promise((resolve, reject) => {
    if (FNB == false) {
      var sections = [
        "Professionalism",
        "Staff Hygiene",
        "General Environment Cleanliness",
        "General Safety",
        "Fire & Emergency Safety",
        "Electrical Safety",
        "End",
      ];
      var start = Section;
      var end;
      var startIndex;
      var endIndex;
      for (var i = 0; i < sections.length; i++) {
        if (sections[i] == start) {
          end = sections[i + 1];
        }
      }
      startIndex = questions.indexOf(start);
      endIndex = questions.indexOf(end);
      for (var i = startIndex + 1; i < endIndex; i++) {
        sectionalisedQns.push(questions[i]);
      }
    } else {
      var sections = [
        "Professionalism",
        "Staff Hygiene",
        "General Environment Cleanliness",
        "Hand Hygiene Facilities",
        "Storage & Preparation of Food",
        "Storage of Food in Refrigerator or Warmer",
        "Food",
        "Beverage",
        "General Safety",
        "Fire & Emergency Safety",
        "Electrical Safety",
        "End",
      ];
      var start = Section;
      var end;
      var startIndex;
      var endIndex;
      for (var i = 0; i < sections.length; i++) {
        if (sections[i] == start) {
          end = sections[i + 1];
        }
      }
      startIndex = questions.indexOf(start);
      endIndex = questions.indexOf(end);
      for (var i = startIndex + 1; i < endIndex; i++) {
        sectionalisedQns.push(questions[i]);
      }
    }
    resolve();
  });
  let result = await promise;
  return sectionalisedQns;
}

app.get("/editNon-F&BAuditFormsSectionOne/:id", async function (req, res) {
  clearAllNonFNBAuditData();
  const sessionCookie = req.cookies.session || "";
  var sessionLogin = req.cookies.loginEmail;
  sessionLogin = sessionLogin.split("@")[0];
  const dataID = req.params.id;
  var SectionOneNonFBProfessionalism = [];
  var SectionOneNonFBStaffHygiene = [];

  var ref = firebase
    .database()
    .ref("Non-F&B-Checklist/" + sessionLogin + "/AuditAnswers");
  ref.on("value", getAnswerData);
  //Load Qn and store in global variable
  NonFNBChecklistQuestions = await getQuestionFromAnswerKey(
    false,
    sessionLogin,
    dataID
  );
  SectionOneNonFBProfessionalism = await sectionaliseQuestions(
    NonFNBChecklistQuestions,
    false,
    "Professionalism"
  );

  SectionOneNonFBStaffHygiene = await sectionaliseQuestions(
    NonFNBChecklistQuestions,
    false,
    "Staff Hygiene"
  );
  //console.log(checklistData);
  //var firebaseData = database.ref("F&B-Checklist/" + dataID);

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then(() => {
      setTimeout(function () {
        delete checklistData.created;
        delete checklistData.sessionEmail;
        var convCheckListData = checklistData;
        var NFBSectionOneImage = checklistData.SectionOneImage;
        var NFBSectionOneImage2 = checklistData.SectionOneImage2;
        res.render("pages/editNonF&BChecklistSectionOne", {
          sessionLogin,
          dataID,
          convCheckListData,
          NFBSectionOneImage,
          NFBSectionOneImage2,
          SectionOneNonFBProfessionalism,
          SectionOneNonFBStaffHygiene,
        });
      }, 300);
    })
    .catch((error) => {
      res.redirect("/login");
    });

  function getAnswerData(data) {
    //console.log("Getting all data");
    var auditScores = data.val();
    checklistData = auditScores[dataID];
  }
});

app.get("/editNon-F&BAuditFormsSectionTwo/:id", async function (req, res) {
  const sessionCookie = req.cookies.session || "";
  var sessionLogin = req.cookies.loginEmail;
  sessionLogin = sessionLogin.split("@")[0];
  const dataID = req.params.id;
  var SectionTwoNonFBGEC = [];
  var a = [];
  var b = [];

  var totalQn;
  var ref = firebase
    .database()
    .ref("Non-F&B-Checklist/" + sessionLogin + "/AuditAnswers");
  ref.on("value", getAnswerData);
  //Load Qn and store in global variable
  SectionTwoNonFBGEC = await sectionaliseQuestions(
    NonFNBChecklistQuestions,
    false,
    "General Environment Cleanliness"
  );

  a = await sectionaliseQuestions(
    NonFNBChecklistQuestions,
    false,
    "Professionalism"
  );

  b = await sectionaliseQuestions(
    NonFNBChecklistQuestions,
    false,
    "Staff Hygiene"
  );

  totalQn = a.length + b.length;
  //console.log(checklistData);
  //var firebaseData = database.ref("F&B-Checklist/" + dataID);

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then(() => {
      setTimeout(function () {
        delete checklistData.created;
        delete checklistData.sessionEmail;
        var convCheckListData = NonFNBsectionTwoChecklistAns;
        var NFBSectionTwoImage = NonFNBsectionTwoChecklistAns.SectionTwoImage;
        var NFBSectionTwoImage2 = NonFNBsectionTwoChecklistAns.SectionTwoImage2;
        res.render("pages/editNonF&BChecklistSectionTwo", {
          sessionLogin,
          NFBSectionTwoImage,
          NFBSectionTwoImage2,
          dataID,
          convCheckListData,
          SectionTwoNonFBGEC,
          totalQn,
        });
      }, 300);
    })
    .catch((error) => {
      res.redirect("/login");
    });

  function getAnswerData(data) {
    //console.log("Getting all data");
    var auditScores = data.val();
    checklistData = auditScores[dataID];
  }
});

app.post("/editNon-F&BAuditFormsSectionTwo/:id", async function (req, res) {
  const sessionCookie = req.cookies.session || "";
  var sessionLogin = req.cookies.loginEmail;
  sessionLogin = sessionLogin.split("@")[0];
  const dataID = req.params.id;
  var SectionTwoNonFBGEC = [];
  NonFNBsectionOneChecklistAns = req.body.checklist;
  var a = [];
  var b = [];

  var totalQn;
  var ref = firebase
    .database()
    .ref("Non-F&B-Checklist/" + sessionLogin + "/AuditAnswers");
  ref.on("value", getAnswerData);
  //Load Qn and store in global variable
  SectionTwoNonFBGEC = await sectionaliseQuestions(
    NonFNBChecklistQuestions,
    false,
    "General Environment Cleanliness"
  );

  a = await sectionaliseQuestions(
    NonFNBChecklistQuestions,
    false,
    "Professionalism"
  );

  b = await sectionaliseQuestions(
    NonFNBChecklistQuestions,
    false,
    "Staff Hygiene"
  );

  totalQn = a.length + b.length;
  // console.log(checklistData);
  //var firebaseData = database.ref("F&B-Checklist/" + dataID);

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then(() => {
      setTimeout(function () {
        delete checklistData.created;
        delete checklistData.sessionEmail;
        var convCheckListData = checklistData;
        var NFBSectionTwoImage = checklistData.SectionTwoImage;
        var NFBSectionTwoImage2 = checklistData.SectionTwoImage2;
        res.render("pages/editNonF&BChecklistSectionTwo", {
          sessionLogin,
          dataID,
          NFBSectionTwoImage,
          NFBSectionTwoImage2,
          convCheckListData,
          SectionTwoNonFBGEC,
          totalQn,
        });
      }, 500);
    })
    .catch((error) => {
      res.redirect("/login");
    });

  function getAnswerData(data) {
    //console.log("Getting all data");
    var auditScores = data.val();
    checklistData = auditScores[dataID];
  }
});

app.post("/editNon-F&BAuditFormsSectionThree/:id", async function (req, res) {
  const sessionCookie = req.cookies.session || "";
  var sessionLogin = req.cookies.loginEmail;
  sessionLogin = sessionLogin.split("@")[0];
  const dataID = req.params.id;
  var SectionThreeNonFBElectricalSafety = [];
  var SectionThreeNonFBFireEmergencySafety = [];
  var SectionThreeNonFBGeneralSafety = [];
  NonFNBsectionTwoChecklistAns = req.body.checklist;
  var a = [];
  var b = [];
  var c = [];
  var totalQn;

  a = await sectionaliseQuestions(
    NonFNBChecklistQuestions,
    false,
    "Professionalism"
  );

  b = await sectionaliseQuestions(
    NonFNBChecklistQuestions,
    false,
    "Staff Hygiene"
  );
  c = await sectionaliseQuestions(
    NonFNBChecklistQuestions,
    false,
    "General Environment Cleanliness"
  );

  totalQn = a.length + b.length + c.length;
  var ref = firebase
    .database()
    .ref("Non-F&B-Checklist/" + sessionLogin + "/AuditAnswers");
  ref.on("value", getAnswerData);
  //Load Qn and store in global variable
  SectionThreeNonFBElectricalSafety = await sectionaliseQuestions(
    NonFNBChecklistQuestions,
    false,
    "Electrical Safety"
  );
  SectionThreeNonFBFireEmergencySafety = await sectionaliseQuestions(
    NonFNBChecklistQuestions,
    false,
    "Fire & Emergency Safety"
  );
  SectionThreeNonFBGeneralSafety = await sectionaliseQuestions(
    NonFNBChecklistQuestions,
    false,
    "General Safety"
  );

  //console.log(checklistData);
  //var firebaseData = database.ref("F&B-Checklist/" + dataID);

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then(() => {
      setTimeout(function () {
        delete checklistData.created;
        delete checklistData.sessionEmail;
        var convCheckListData = checklistData;
        var NFBSectionThreeImage = checklistData.SectionThreeImage;
        var NFBSectionThreeImage2 = checklistData.SectionThreeImage2;
        res.render("pages/editNonF&BChecklistSectionThree", {
          sessionLogin,
          dataID,
          NFBSectionThreeImage,
          NFBSectionThreeImage2,
          convCheckListData,
          SectionThreeNonFBGeneralSafety,
          SectionThreeNonFBFireEmergencySafety,
          SectionThreeNonFBElectricalSafety,
          totalQn,
        });
      }, 300);
    })
    .catch((error) => {
      res.redirect("/login");
    });

  function getAnswerData(data) {
    //console.log("Getting all data");
    var auditScores = data.val();
    checklistData = auditScores[dataID];
  }
});

app.post("/editNon-F&BAuditFormsSubmission/:id", async function (req, res) {
  console.log("Loading Checklist post");
  const sessionCookie = req.cookies.session || "";
  var sessionEmail = req.cookies.loginEmail;
  var dataID = req.params.id;
  sessionEmail = sessionEmail.split("@")[0];
  NonFNBsectionThreeChecklistAns = req.body.checklist;

  let combChecklist = {
    ...NonFNBsectionOneChecklistAns,
    ...NonFNBsectionTwoChecklistAns,
    ...NonFNBsectionThreeChecklistAns,
  };
  //console.log("Session cookie is: " + sessionCookie);
  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(() => {
      // To remove any script tag in the body
      //req.body.checklist.body = req.sanitize(req.body.checklist.body);
      //console.log(combChecklist);
      //console.log(checkListQn);

      database
        .ref(
          "Non-F&B-Checklist/" + sessionEmail + "/" + "AuditAnswers/" + dataID
        )
        .update(combChecklist, function (err) {
          if (err) {
            console.log("Error Creating:" + error);
            res.render("new");
          } else {
            console.log("Create successful!");
            //console.log(newBlogKey);
            // newBlogRef.off();
            res.redirect("/fullpage1-NonFB/" + dataID);
          }
        });
    })
    .catch((error) => {
      console.log(error);
      res.redirect("/login");
    });
});

app.get("/sessionLogout", (req, res) => {
  firebase.auth().signOut();
  res.clearCookie("session");
  res.clearCookie("loginEmail");
  isAdmin = false;
  res.redirect("/login");
});

app.listen(3000, function () {
  console.log("Audit Checklist started at Port 3000");
});
