import mongoose from "mongoose";
import normalize from "normalize-mongoose";

const gigSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    gigProviderOfferPrice: {
        type: Number,
        required: true,
    },
    gigOfferOpenWindow: {
        type: Date,
        required: true,
    },
    gigImageUrl: {
        type: String,
    },
    gigPoster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    gigBids: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bid'
        }
    ],
}, { timestamps: true}
);

gigSchema.plugin(normalize);

export const gigModel = mongoose.model('Gig', gigSchema);