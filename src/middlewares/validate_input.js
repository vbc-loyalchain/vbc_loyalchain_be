const validate_input = (Schema) => async (req, res, next) => {
    try {
        const value = await Schema.validateAsync(req.body);
        console.log(value);
        next()
    } catch (error) {
        res.status(400);
        next(error)
    }
}

export default validate_input;