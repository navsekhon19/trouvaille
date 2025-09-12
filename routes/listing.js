const express= require("express");
const router= express.Router();
const multer  = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });


const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const{ isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");

//New Route
router.get("/new", 
  isLoggedIn, 
  listingController.renderNewForm);

// Category Filter Route
router.get("/category/:categoryName",
   wrapAsync(listingController.showCategory));

//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner,
  wrapAsync(listingController.renderEditForm));

//Show Route
router.get("/:id", wrapAsync(listingController.showListing));

//Index Route & Create Route
router.route("/")
.get(wrapAsync(listingController.index))
.post(
  isLoggedIn,  
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.createListing));

//Update Route Delete Route
router.route("/:id")
.put(
  isLoggedIn, 
  isOwner, 
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.updateListing))
.delete(
  isLoggedIn, 
  isOwner,
  wrapAsync(listingController.destroyListing));

module.exports= router;

