import { bidModel } from "../models/bid.model.js";
import { gigModel } from "../models/gig.model.js";
import { userModel } from "../models/user.model.js";


export const createBid = async (req, res) => {
    const { serviceProviderBidPrice } = req.body;
    const gigId = req.params.gigId; // Get the gigId from the request parameters
    const userId = req.user.id; // Get the userId from the request object user field set in the auth middleware

    const bidGigPoster = gigModel.findById(gigId)
        .select('gigPoster')
    console.log(bidGigPoster)

    try { 
        const newBid = await bidModel.create({
            serviceProviderBidPrice,
            bidGig: gigId,
            bidder: userId,
            bidGigPoster: bidGigPoster
        });

        const bidder = await userModel.findById(userId)
                .select('userName email password profileImageUrl isVerified') 

        const sanitizedBid = {
            bidId: newBid._id,
            serviceProviderBidPrice: newBid.serviceProviderBidPrice,
            bidStatus: newBid.bidStatus,
            bidDate: newBid.bidDate,
            gigTheBidWasMadeOn: newBid.bidGig,
            bidder: bidder
        }

        // Add the new bid to the gig's gigbids array
        const biddedGig = await gigModel.findById(gigId);
        if (!biddedGig) {
            return res.status(404).json({ message: "Gig not found" });
        }
        biddedGig.gigBids.push(newBid._id);
        await biddedGig.save()

        // Add the new bid to the users bids array
        const biddedGigs_Provider = await userModel.findById(userId);
        if (!biddedGigs_Provider) {
            return res.status(404).json({ message: "User not found" });
        }
        biddedGigs_Provider.bids.push(newBid._id);
        await biddedGigs_Provider.save();

        // send the response with the sanitized bid data to frontend
        res.status(201).json({ message: "Bid created successfully", data: sanitizedBid });

    }catch (error) {
        console.log(`This error was thrown in an attempt to create the bid: ${error.message}`);
        res.status(500).json({ message: `This error was thrown in an attempt to create the bid: ${error.message}` });
    }
    
}

export const viewBids = async (req, res) => {
 
    if (req.user.role === 'gigPoster') {
        viewBidsForMyGigs(req, res);
    } else {
        viewMyBids(req, res);
    }
}

    const viewBidsForMyGigs = async (req, res) => {
        const userId = req.user.id; // Get the userId from the request object field set in the auth middleware

        try {
            const bids = await bidModel.find({ bidGigPoster: userId })
                         .populate({
                            path: 'bidGig',
                            select: '-createdAt -updatedAt -__v -gigBids'
                         })
                         .populate({
                            path: 'bidder'
                         })
                console.log(bids)
                                                
                if (!bids) {
                    res.status(404).json({ message: `No bids available` });
                    return;
                }
                    res.status(200).json({ message: "This users Bids were retrieved successfully", data: bids});
        
                } catch (error) {
                    console.log(`This error was thrown in an attempt to retrieve the users Bids: ${error.message}`);
                    res.status(500).json({ message: `This error was thrown in an attempt to retrieve the users Bids: ${error.message}` });
                }
    }

    const viewMyBids = async (req, res) => {
        const userId = req.user.id; // Get the userId from the request object field set in the auth middleware

        try {
                    const user = await userModel.findById(userId)
                                                .select('-gigs -role -isVerified -createdAt -updatedAt -__v')
                                                .populate({
                                                    path: 'bids',
                                                    populate: [
                                                        {
                                                            path: 'bidGig',
                                                            select: 'name description gigProviderOffer gigBids'
                                                        }
                                                    ]
                                                })
                                                
                    
                if (!user) {
                    res.status(404).json({ message: `User with ID: ${userId} was not found` });
                    return;
                }
                    res.status(200).json({ message: "The users Bids were retrieved successfully", data: user});
        
                } catch (error) {
                    console.log(`This error was thrown in an attempt to retrieve the users Bids: ${error.message}`);
                    res.status(500).json({ message: `This error was thrown in an attempt to retrieve the users Bids: ${error.message}` });
                }
    }

export const acceptBid = async (req, res) => {
        const bidId = req.params.bidId;//Get the ID for the particular bid we want to operate on from req.params field sent by frontend

        try {
            // To ensure that the user is accepting a bid they are authorized to accept, find the bid using the users ID and the Bids ID. If a bid is retrieved with these fields then the user is authorized to operate on the bid.
            const acceptedBid = await bidModel.findOneAndUpdate(
                {_id: bidId}, //correct this later so it will ensure you can only accept bids your own gigs only
                {bidStatus: 'accepted'}, 
                {new: true}
            );
            if (!acceptedBid) {
                return res.status(200).json({message: "Bid acceptance failed"})
            }

            // Once a bid is accepted, we want to reject all other bids automaticaly
            await bidModel.updateMany(
                {
                    bidGig: acceptedBid.bidGig, //Finds all other bids related to this gig ID
                    _id: { $ne: bidId } // Exclude the accepted bid in your findings-- $ne means not equalTo. so this line means find all bids for the above gig but ignore one such bid whose id is not equal to bidID
                },
                { $set: { bidStatus: 'rejected' } } //This is the actual update operation-- this line sets the bidStatus field in all the findings to 'rejected'
            );

            // send a response
            res.status(200).json({ message: "Bid acceptance was a success", data: acceptedBid });

        } catch (error) {
            return res.status(500).json({message: `This error was thrown in an attempt to update user info: ${error.message}`});
        }
    }

export const rejectBid = async (req, res) => {
        const bidId = req.params.bidId;
    
        try {
            const rejectedBid = await bidModel.findOneAndUpdate(
                { _id: bidId, bidGigPoster: req.user.id },
                { bidStatus: 'rejected' },
                { new: true }
            );
            if (!rejectedBid) {
                return res.status(200).json({ message: "Bid rejection failed" });
            }
    
            res.status(200).json({ message: "Bid rejection was a success", data: rejectedBid });
    
        } catch (error) {
            return res.status(500).json({ message: `This error was thrown in an attempt to update user info: ${error.message}` });
        }
    }

export const deleteBid = async (req, res) => {
        const bidId = req.params.bidId;//Get the ID for the particular bid we want to operate on from req.params field sent by frontend
        const userId = req.user.id;
    
        try {
            // Atomically find and delete the bid if it belongs to the user and is not accepted
            const deletedBid = await bidModel.findOneAndDelete({
                _id: bidId,
                bidGigPoster: userId,
                bidStatus: { $ne: 'accepted' }
            });
    
            if (!deletedBid) {
                return res.status(404).json({ message: "Bid not found, not yours, or already accepted" });
            }
    
            // Remove the bid from the related gig's gigBids array
            await gigModel.findByIdAndUpdate(
                deletedBid.bidGig,
                { $pull: { gigBids: bidId } }
            );
    
            // Remove the bid from the user's bids array
            await userModel.findByIdAndUpdate(
                userId,
                { $pull: { bids: bidId } }
            );
    
            res.status(200).json({ message: "Bid deleted successfully", data: deletedBid });
        } catch (error) {
            res.status(500).json({ message: `This error was thrown in an attempt to delete the bid: ${error.message}` });
        }
    }
