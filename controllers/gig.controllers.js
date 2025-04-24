import { gigModel } from "../models/gig.model.js";
import { gigValidator } from "../validators/gig.validator.js";
import { userModel } from "../models/user.model.js";

export const createGig = async (req, res) => {
    try {
        // Validate the request body using the gigValidator
        const {error, value} = gigValidator.validate(req.body);
        if (error) {
            return res.status(400).json(`Kindly check the request body for the following errors: ${error.details.map(err => err.message).join(', ')}`);
        } 
        // If the validation passes, proceed to extract the gig info from the request body

        // Extract the gig info from the request body
        const reqGigInfo = req.body;

        reqGigInfo.gigPoster = req.user.id; // Add the userId of the user that created the gig to the gig info object that will be saved to the database.
        //This creates a relationship between them


        // Extract Gig Name from the request body for testing purposes
        const { name } = req.body;
        console.log(`gigName: ${name}`)

        // Check if the gig image was uploaded successfully and is present in the request body. If so, add the url to the request body so it can be saved to the database
        if (req.file) {
            reqGigInfo.gigImageUrl = req.file.path;
        }

        // Create a new gig that follows the schema model definition

        const modelGig = new gigModel(reqGigInfo);

        //Code to check if this particular user is not posting a gig with thesame name goes here------ future consideration

        // If the image was uploaded successfully, it will be present in the request body as req.file or req.files depending on the type of upload you are doing, single or multiple.
        if (!req.file) {
            console.log('No image uploaded or Image upload failed')
        }

        // Save the gig info to the database once the gig does not already has been verified to not exist
        await modelGig.save();

        // Add the userId of the user that created the gig to the gig document in the gigPoster field
        // This will create a relationship between the gig and the user that created it
        await userModel.findByIdAndUpdate(req.user.id, {
            $push: { gigs: modelGig.id }
          });

        const sanitizedGig = {
            name: modelGig.name,
            description: modelGig.description,
            gigProviderOfferPrice: modelGig.gigProviderOfferPrice,
            gigOfferOpenWindow: modelGig.gigOfferOpenWindow,
            gigStartDate: modelGig.gigStartDate,
            location: modelGig.location,
            gigImageUrl: modelGig.gigImageUrl,
            gigPoster: modelGig.gigPoster
        }

        res.status(201).json({ message: "Gig was created successfully", data: sanitizedGig });

    } catch (error) {
        res.send(`This error was thrown in an attempt to create the gig: ${error.message}`);
    }
}

export const viewGig = async (req, res) => {
    if (req.body.role === 'gigPoster') {
        viewMyGigs(req, res);
    } else {
        viewGigsProvided(req, res);
    }
}

    const viewMyGigs = async (req, res) => {
        const userId = req.user.id; // Get the userId from the request object field set in the auth middleware
        try {
            const user = await userModel.findById(userId)
                                        .select('-bids')
                                        .populate({
                                            path: 'gigs',
                                            select: '-gigPoster',
                                            populate: {
                                                path: 'gigBids' // This will populate the bids inside each gig
                                                // I can also add select here if you want to exclude fields from the bids like this:
                                                ,select: '-bidGig -bidGigPoster'
                                            }
                                        })
                                        
            
        if (!user) {
            res.status(404).json({ message: `User with ID: ${userId} was not found` });
            return;
        }
            res.status(200).json({ message: "The users Gigs were retrieved successfully", data: user});

        } catch (error) {
            console.log(`This error was thrown in an attempt to retrieve the users Gigs: ${error.message}`);
            res.status(500).json({ message: `This error was thrown in an attempt to retrieve the users Gigs: ${error.message}` });
        }
    }

    const viewGigsProvided = async (req, res) => {
        try {

            const allGigs = await gigModel.find({})
                .populate({
                    path: 'gigPoster',
                    select: '-_id -email -role -gigs -createdAt -updatedAt -verificationToken -bids -__v' // Exclude these fields from the populated user
                }).select('-createdAt -updatedAt') // Exclude these fields from the gig model;

            res.status(200).json({ message: "All Gigs provided were retrieved successfully", data: allGigs});
        } catch (error) {
            console.log(`This error was thrown in an attempt to retrieve all users: ${error.message}`);
            res.status(500).json({ message: `This error was thrown in an attempt to retrieve all users: ${error.message}` });
        }
    }

export const viewSingleGigbyId = async (req, res) => {
    const gigsId = req.params.gigId
    try {
        const singleGig = await gigModel.findById({"id": gigsId})
            .populate({
                path: 'gigPoster',
                select: '-_id -email -role -gigs -createdAt -updatedAt -verificationToken -bids -__v' // Exclude these fields from the populated user
            }).select('-createdAt -updatedAt') // Exclude these fields from the gig model;

        if (!singleGig) {
            return res.status(404).json({ message: `User with ID: ${userId} was not found` });
        }

        res.status(200).json({ message: "The clicked gig was retrieved successfully", data: singleGig});

    } catch (error) {
        console.log(`This error was thrown in an attempt to retrieve all users: ${error.message}`);
        res.status(500).json({ message: `This error was thrown in an attempt to retrieve all users: ${error.message}` });
    }
    }

export const deleteGig = async (req, res) => {
    try {
        const gigId = req.params.id; // Get the gigId from the request parameters
        const userId = req.user.id; // Get the userId from the request object

        // Find the gig by ID and delete it
        const deletedGig = await gigModel.findOneAndDelete({ _id: gigId, gigPoster: userId });

        if (!deletedGig) {
            return res.status(404).json({ message: `Gig with ID: ${gigId} was not found or the user is not authorized to delete it` });
        }

        // Remove the gig reference from the user's gigs array
        await userModel.findByIdAndUpdate(userId, { $pull: { gigs: gigId } });

        res.status(200).json({ message: "Gig deleted successfully", data: deletedGig });
    } catch (error) {
        console.log(`This error was thrown in an attempt to delete the gig: ${error.message}`);
        res.status(500).json({ message: `This error was thrown in an attempt to delete the gig: ${error.message}` });
    }
}