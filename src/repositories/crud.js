const create = async (model, newInstance) => {
    const newEntry = new model(newInstance);
    await newEntry.save();
    return newEntry;
}

const getOne = async (model, filterObj) => {
    const entry_found = await model.findOne(filterObj);
    return entry_found;
}

const getById = async (model, id) => {
    const entry_found = await model.findById(id);
    return entry_found;
}

const getAll = async (model, filterObj, projection = null, options = {}) => {
    const allEntryFound = await model.find(filterObj, projection, options);
    return allEntryFound;
}

const getAllBeforePopulate = (model, filterObj, projection = null, options = {}) => {
    return model.find(filterObj, projection, options);
}

const updateEntry = async (model, filterObj, updateObj) => {
    const updatedEntry = await model.findOneAndUpdate(filterObj, updateObj, {
        new: true
    });

    return updatedEntry;
}

const updateEntryById = async (model, id, updateObj, options = {}) => {
    const updatedEntry = await model.findByIdAndUpdate(id, updateObj, options);

    return updatedEntry;
}

const deleteEntry = async(model, filter_obj) => {
    await model.deleteOne(filter_obj);
}

export {
    create, getOne, getById, getAll, getAllBeforePopulate, updateEntry, updateEntryById, deleteEntry
}

