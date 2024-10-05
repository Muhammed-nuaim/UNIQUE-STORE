const loadHomePage = async( req,res ) => {
    try {
        res.render("User/index")
    } catch (error) {
        console.log(error.message)
    }
}

module.exports={
    loadHomePage,
}