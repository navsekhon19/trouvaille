const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index = async (req, res) => {
  const { country } = req.query;
  let filter = {};
  if (country) {
    filter.country = { $regex: country, $options: "i" };
  }
  const listings = await Listing.find(filter);
  if (country && listings.length === 0) {
    req.flash("error", "No listing available for selected country");
    return res.redirect("/listings");
  }  
  res.render("listings/index", { listings, country });
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      })
      .populate("owner");
    if(!listing){
      req.flash("error", "Listing you are requesting for does not exist");
      return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
  };

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.createListing = async (req, res ,next) => {
  let response = await geocodingClient
  .forwardGeocode({
  query: req.body.listing.location ,
  limit: 1
  })
  .send();

  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = {url, filename};
  newListing.geometry = response.body.features[0].geometry;
  let savedListing = await newListing.save();
  console.log(savedListing);
  req.flash("success", "New Listing Added!");
  res.redirect("/listings");
  };

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if(!listing){
    req.flash("error", "Listing you are requesting for does not exist");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  const oldLocation = listing.location;
  Object.assign(listing, req.body.listing);
  if (req.body.listing.location && req.body.listing.location !== oldLocation) {
    let response = await geocodingClient
      .forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      })
      .send();

    listing.geometry = response.body.features[0].geometry;
  }
  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
  }
  await listing.save();
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};


module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted Successfully!");
  res.redirect("/listings");
};

module.exports.showCategory = async (req, res) => {
  const { categoryName } = req.params;
  const filteredListings = await Listing.find({ category: categoryName });
  res.render("listings/category.ejs", { 
    filteredListings,
    categoryName
  });
};
