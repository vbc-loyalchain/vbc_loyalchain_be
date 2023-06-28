const validate_input = (Schema) => async (req, res, next) => {
    try {
        const method = req.method
        const schemaToValidate = method === 'GET' ? req.query : req.body;
        const value = await Schema.validateAsync(schemaToValidate);
        console.log(value);
        next()
    } catch (error) {
        res.status(400);
        next(error)
    }
}

export default validate_input;