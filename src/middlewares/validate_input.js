const validate_input = (Schema) => async (req, res, next) => {
    try {
        const method = req.method
        if(method === 'GET'){
            req.query = await Schema.validateAsync(req.query);
            console.log(req.query)
        }
        else{
            req.body = await Schema.validateAsync(req.body);
            console.log(req.body)
        }
        next()
    } catch (error) {
        res.status(400);
        next(error)
    }
}

export default validate_input;