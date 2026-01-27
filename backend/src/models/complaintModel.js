import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['roads', 'power', 'sanitation', 'water', 'other']
  },
  
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    index: true
  },
  
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true,
    index: true
  },
  
  landmark: {
    type: String,
    required: [true, 'Landmark/Area is required'],
    trim: true,
    maxlength: [200, 'Landmark cannot exceed 200 characters']
  },
  
  pincode: {
    type: String,
    trim: true,
    match: [/^\d{6}$/, 'Please enter valid 6-digit pincode']
  },
  
  images: {
    type: [String],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.length <= 5;
      },
      message: 'Maximum 5 images allowed'
    }
  },
  
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'resolved', 'rejected'],
    default: 'pending',
    index: true
  },
  
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    default: null,
    index: true
  },
  
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    default: null
  },
  
  assignedAt: {
    type: Date,
    default: null
  },
  
  // ✅ NEW FIELD - Track when staff starts working
  startedAt: {
    type: Date,
    default: null
  },
  
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    index: true
  },
  
  resolvedAt: {
    type: Date,
    default: null
  },
  
  resolutionNote: {
    type: String,
    trim: true,
    maxlength: [1000, 'Resolution note cannot exceed 1000 characters']
  },
  
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters'],
    default: ''
  },
  
}, { timestamps: true });

complaintSchema.index({ state: 1, district: 1, status: 1 });
complaintSchema.index({ citizen: 1, status: 1 });
complaintSchema.index({ assignedTo: 1, status: 1 });

const complaintModel = mongoose.model('complaint', complaintSchema);

export default complaintModel;