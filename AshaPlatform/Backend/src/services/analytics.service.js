// Backend/src/services/analytics.service.js
import { ChatMessage } from '../models/chat-message.model.js';

/**
 * Service for analytics-related operations
 */
class AnalyticsService {
  /**
   * Get analytics dashboard data for bias detection
   * 
   * @param {Object} options - Query options
   * @param {Date} options.startDate - Start date for analytics
   * @param {Date} options.endDate - End date for analytics
   * @returns {Promise<Object>} - Analytics data
   */
  async getBiasAnalytics(options = {}) {
    const { startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), endDate = new Date() } = options;
    
    try {
      // Aggregated analytics for bias detection effectiveness
      const biasAnalytics = await ChatMessage.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate, $lte: endDate },
            biasDetected: true
          }
        },
        {
          $group: {
            _id: "$biasCategory",
            count: { $sum: 1 },
            averageScore: { $avg: "$biasScore" },
            redirected: { $sum: { $cond: ["$biasRedirected", 1, 0] } }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);
      
      // Summary statistics
      const totalMessages = await ChatMessage.countDocuments({
        timestamp: { $gte: startDate, $lte: endDate }
      });
      
      const biasedMessages = await ChatMessage.countDocuments({
        timestamp: { $gte: startDate, $lte: endDate },
        biasDetected: true
      });
      
      const redirectedMessages = await ChatMessage.countDocuments({
        timestamp: { $gte: startDate, $lte: endDate },
        biasRedirected: true
      });
      
      return {
        summary: {
          totalMessages,
          biasedMessages,
          biasRate: biasedMessages / totalMessages,
          redirectedMessages,
          redirectionRate: redirectedMessages / (biasedMessages || 1)
        },
        biasAnalytics
      };
    } catch (error) {
      console.error("Error getting bias analytics:", error);
      throw error;
    }
  }
  
  /**
   * Submit user feedback for a bias redirection
   * 
   * @param {Object} feedbackData - Feedback data
   * @param {string} feedbackData.messageId - ID of the redirected message
   * @param {boolean} feedbackData.wasEffective - Whether the redirection was effective
   * @param {string} feedbackData.userId - User ID
   * @param {string} feedbackData.feedbackText - Optional feedback text
   * @returns {Promise<Object>} - Updated message with feedback
   */
  async submitBiasRedirectionFeedback(feedbackData) {
    try {
      const { messageId, wasEffective, userId, feedbackText = null } = feedbackData;
      
      // Update message with feedback
      const updatedMessage = await ChatMessage.findByIdAndUpdate(
        messageId,
        {
          $set: {
            biasRedirectionEffective: wasEffective,
            'analyticsData.feedback': {
              timestamp: new Date(),
              wasEffective,
              feedbackText
            }
          }
        },
        { new: true }
      );
      
      return updatedMessage;
    } catch (error) {
      console.error("Error submitting bias redirection feedback:", error);
      throw error;
    }
  }
  
  /**
   * Get user engagement metrics
   * 
   * @param {Object} options - Query options
   * @param {Date} options.startDate - Start date for analytics
   * @param {Date} options.endDate - End date for analytics
   * @param {number} options.limit - Maximum number of users to return
   * @returns {Promise<Array>} - User engagement metrics
   */
  async getUserEngagementMetrics(options = {}) {
    const { 
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
      endDate = new Date(),
      limit = 100
    } = options;
    
    try {
      const engagementMetrics = await ChatMessage.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: "$userId",
            messageCount: { $sum: 1 },
            averageLength: { $avg: { $strLenCP: "$text" } },
            sentiments: {
              $push: "$sentiment"
            },
            lastActive: { $max: "$timestamp" },
            biasedMessages: {
              $sum: { $cond: ["$biasDetected", 1, 0] }
            },
            biasRedirectedMessages: {
              $sum: { $cond: ["$biasRedirected", 1, 0] }
            }
          }
        },
        {
          $project: {
            messageCount: 1,
            averageLength: 1,
            lastActive: 1,
            biasedMessages: 1,
            biasRedirectedMessages: 1,
            positiveCount: {
              $size: {
                $filter: {
                  input: "$sentiments",
                  as: "sentiment",
                  cond: { $eq: ["$$sentiment", "positive"] }
                }
              }
            },
            negativeCount: {
              $size: {
                $filter: {
                  input: "$sentiments",
                  as: "sentiment",
                  cond: { $eq: ["$$sentiment", "negative"] }
                }
              }
            },
            neutralCount: {
              $size: {
                $filter: {
                  input: "$sentiments",
                  as: "sentiment",
                  cond: { $eq: ["$$sentiment", "neutral"] }
                }
              }
            }
          }
        },
        {
          $sort: { messageCount: -1 }
        },
        {
          $limit: limit
        }
      ]);
      
      return engagementMetrics;
    } catch (error) {
      console.error("Error getting user engagement metrics:", error);
      throw error;
    }
  }
  
  /**
   * Get bias mitigation effectiveness metrics
   * 
   * @param {Object} options - Query options
   * @param {Date} options.startDate - Start date for analytics
   * @param {Date} options.endDate - End date for analytics
   * @returns {Promise<Object>} - Bias mitigation effectiveness metrics
   */
  async getBiasMitigationEffectiveness(options = {}) {
    const { startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), endDate = new Date() } = options;
    
    try {
      // Bias mitigation effectiveness by tracking if follow-up messages contain bias
      const biasEffectiveness = await ChatMessage.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate, $lte: endDate },
            biasRedirected: true
          }
        },
        {
          $lookup: {
            from: "chatMessages",
            let: { userId: "$userId", timestamp: "$timestamp" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$userId", "$$userId"] },
                      { $gt: ["$timestamp", "$$timestamp"] }
                    ]
                  }
                }
              },
              { $sort: { timestamp: 1 } },
              { $limit: 1 }
            ],
            as: "nextMessage"
          }
        },
        {
          $project: {
            biasCategory: 1,
            biasScore: 1,
            hasFollowUp: { $gt: [{ $size: "$nextMessage" }, 0] },
            followUpBiased: {
              $cond: {
                if: { $gt: [{ $size: "$nextMessage" }, 0] },
                then: { $arrayElemAt: ["$nextMessage.biasDetected", 0] },
                else: false
              }
            }
          }
        },
        {
          $group: {
            _id: "effectiveness",
            total: { $sum: 1 },
            withFollowUp: { $sum: { $cond: ["$hasFollowUp", 1, 0] } },
            followUpNoBias: {
              $sum: {
                $cond: {
                  if: { $and: ["$hasFollowUp", { $eq: ["$followUpBiased", false] }] },
                  then: 1,
                  else: 0
                }
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            total: 1,
            withFollowUp: 1,
            followUpNoBias: 1,
            effectivenessRate: {
              $cond: {
                if: { $gt: ["$withFollowUp", 0] },
                then: { $divide: ["$followUpNoBias", "$withFollowUp"] },
                else: 0
              }
            }
          }
        }
      ]);
      
      // Get breakdown by bias category
      const biasCategoryEffectiveness = await ChatMessage.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate, $lte: endDate },
            biasRedirected: true
          }
        },
        {
          $lookup: {
            from: "chatMessages",
            let: { userId: "$userId", timestamp: "$timestamp" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$userId", "$$userId"] },
                      { $gt: ["$timestamp", "$$timestamp"] }
                    ]
                  }
                }
              },
              { $sort: { timestamp: 1 } },
              { $limit: 1 }
            ],
            as: "nextMessage"
          }
        },
        {
          $project: {
            biasCategory: 1,
            biasScore: 1,
            hasFollowUp: { $gt: [{ $size: "$nextMessage" }, 0] },
            followUpBiased: {
              $cond: {
                if: { $gt: [{ $size: "$nextMessage" }, 0] },
                then: { $arrayElemAt: ["$nextMessage.biasDetected", 0] },
                else: false
              }
            }
          }
        },
        {
          $group: {
            _id: "$biasCategory",
            total: { $sum: 1 },
            withFollowUp: { $sum: { $cond: ["$hasFollowUp", 1, 0] } },
            followUpNoBias: {
              $sum: {
                $cond: {
                  if: { $and: ["$hasFollowUp", { $eq: ["$followUpBiased", false] }] },
                  then: 1,
                  else: 0
                }
              }
            }
          }
        },
        {
          $project: {
            category: "$_id",
            _id: 0,
            total: 1,
            withFollowUp: 1,
            followUpNoBias: 1,
            effectivenessRate: {
              $cond: {
                if: { $gt: ["$withFollowUp", 0] },
                then: { $divide: ["$followUpNoBias", "$withFollowUp"] },
                else: 0
              }
            }
          }
        },
        {
          $sort: { total: -1 }
        }
      ]);
      
      return {
        overall: biasEffectiveness[0] || {
          total: 0,
          withFollowUp: 0,
          followUpNoBias: 0,
          effectivenessRate: 0
        },
        byCategory: biasCategoryEffectiveness
      };
    } catch (error) {
      console.error("Error getting bias mitigation effectiveness:", error);
      throw error;
    }
  }
}

export default new AnalyticsService();