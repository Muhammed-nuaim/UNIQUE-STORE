const pageNotFound = async(req,res) => {
    try {
        res.render("page-404")
    } catch (error) {
        res.redirect('/pageNotFound')
    }
}

const loadHomePage = async( req,res ) => {
    try {
        res.render("User/home")
    } catch (error) {
        console.log("Home page is not found");
        res.status(500).send("Server error")
    }
}

module.exports={
    pageNotFound,
    loadHomePage,
}