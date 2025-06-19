import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['income', 'expense']
    },
    icon: {
        type: String,
        default: '💰'
    },
    color: {
        type: String,
        default: 'from-blue-500 to-blue-600'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Verificar si el modelo ya existe antes de crearlo
export default mongoose.models.Category || mongoose.model('Category', categorySchema);