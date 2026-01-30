
import mongoose from "mongoose";

const supportSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Technical Issue',
      'Account Problem',
      'Complaint Not Assigned',
      'Complaint Status Query',
      'Feature Request',
      'Feedback',
      'Workload Concern',
      'Escalation',
      'Other'
    ]

  },
  
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  
  sender: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'user',
  required: true,
  index: true
  },

  senderRole: {
  type: String,
  enum: ['citizen', 'staff'],
  required: true,
  index: true
  },
  
  status: {
    type: String,
    enum: ['pending', 'responded'],
    default: 'pending',
    index: true
  },
  
  respondedAt: {
    type: Date,
    default: null
  }
  
}, { timestamps: true });

supportSchema.index({ sender: 1, senderRole: 1, status: 1 });

const supportModel = mongoose.model('support', supportSchema);

export default supportModel;
