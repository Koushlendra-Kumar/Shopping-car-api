exports.homepage = ( req, res ) => {
    res
        .status(200)
        .json({ 
            title: 'Modern House', 
            message: 'Welcome to Modern House Furniture shop.' 
        })
};
