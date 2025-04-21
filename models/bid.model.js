import mongoose from "mongoose";
import normalize from "normalize-mongoose";

const bidSchema = new mongoose.Schema({
    serviceProviderBidPrice: {
        type: Number,
        required: true,
    },
    bidStatus: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    },
    bidDate: {
        type: Date,
        default: Date.now,
    },
    bidGig: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gig',
        required: true,
    },
    bidGigPoster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
});

bidSchema.plugin(normalize);

export const bidModel = mongoose.model('Bid', bidSchema);