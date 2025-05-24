# Video Management & Troubleshooting Guide

## New Video Generation System

### Submit-and-Forget Workflow
✅ **No more waiting!** You can now submit multiple video generation requests without polling or waiting for completion.

✅ **Rate Limiting**: Smart limits prevent abuse while allowing parallel generation:
- **Concurrent Limit**: Maximum 5 videos generating at once
- **Daily Limit**: Maximum 20 videos per day
- **Real-time Feedback**: See your current usage and remaining capacity

### How It Works
1. **Submit Multiple Videos**: Generate up to 5 videos simultaneously
2. **Check Progress**: Visit "My Videos" to see status updates
3. **No Blocking**: Create more videos while others are processing
4. **Automatic Management**: System handles queuing and completion

## My Videos Table View

### Table Features
- **Preview Column**: Small video previews for completed videos
- **Status Tracking**: Clear status badges (Generating ⏳, Completed ✅, Failed ❌)
- **Quick Actions**: View and download buttons for completed videos
- **Sortable**: Sort by newest, oldest, name, or status
- **Searchable**: Find videos by title or prompt text
- **View Toggle**: Switch between table and grid views

### Status Indicators
| Status | Badge | Description |
|--------|-------|-------------|
| Generating | ⏳ Generating | Video is in the AI generation queue |
| Completed | ✅ Completed | Video is ready to view and download |
| Failed | ❌ Failed | Generation failed (hover for error details) |

## Rate Limiting System

### Current Limits
- **Concurrent**: 5 videos generating simultaneously
- **Daily**: 20 videos per 24-hour period
- **Reset**: Daily limit resets 24 hours after first video of the day

### Visual Indicators
- **Studio Page**: Rate limit info box shows current usage
- **My Videos**: Warning banner when limits are reached
- **Button States**: Create button disabled when limits exceeded

## Common Issues and Solutions

### Issue: Can't Create New Videos

#### **Likely Causes:**
1. **Concurrent Limit**: You have 5 videos currently generating
2. **Daily Limit**: You've reached the 20 videos per day limit

#### **Solutions:**
1. **Wait for Completion**: Let some generating videos finish
2. **Check My Videos**: See which videos are still processing
3. **Daily Reset**: Wait for 24-hour reset if daily limit reached

### Issue: Videos Don't Preview in Table

#### **Likely Causes:**
1. **Expired URLs**: Convex storage URLs are temporary and expire
2. **CORS Issues**: Browser security policies blocking video playback
3. **Network Problems**: Slow or interrupted downloads

#### **Solutions Implemented:**

1. **Enhanced VideoPlayer Component**:
   - ✅ Better error handling with specific error messages
   - ✅ Automatic retry functionality (up to 3 attempts)
   - ✅ CORS handling with `crossOrigin="anonymous"`
   - ✅ Cache busting for failed loads

2. **Smart Table Design**:
   - ✅ Small preview thumbnails that load quickly
   - ✅ Fallback icons when previews fail
   - ✅ Hover controls in grid view
   - ✅ Quick access to full video modal

3. **URL Refresh System**:
   - ✅ Automatic URL regeneration when needed
   - ✅ Manual refresh options in video modal
   - ✅ Real-time video data updates

## How to Use the New System

### For Video Creation:
1. **Check Limits**: See your usage in the Studio page header
2. **Submit Videos**: Create multiple videos without waiting
3. **Track Progress**: Monitor status in My Videos table
4. **Manage Queue**: Let completed videos finish to free up slots

### For Video Management:
1. **Table View** (Default): Efficient overview of all videos
   - See status, creation date, and details at a glance
   - Quick preview thumbnails
   - Direct view/download actions

2. **Grid View**: Visual card layout
   - Larger previews with hover controls
   - Better for browsing completed videos
   - Same functionality as before

### For Troubleshooting:
1. **Status Column**: Check if videos are still generating or failed
2. **Error Details**: Hover over failed videos to see error messages
3. **Refresh Options**: Use modal refresh button for URL issues
4. **Download Fallback**: Direct download always available

## Error Messages and Solutions

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "Rate limit exceeded: You can only have 5 videos generating at once" | Too many concurrent videos | Wait for some to complete |
| "Daily limit exceeded: You can only create 20 videos per day" | Daily quota reached | Wait for 24-hour reset |
| "Video source not accessible or expired" | URL expired | Use refresh button in modal |
| "Network error while loading video" | Connection issues | Check internet connection |

## Best Practices

### Video Generation:
1. **Plan Your Queue**: Submit related videos together
2. **Monitor Limits**: Keep track of your daily usage
3. **Stagger Submissions**: Don't hit limits too quickly
4. **Use Descriptive Titles**: Easier to manage in the table

### Video Management:
1. **Regular Cleanup**: Download and organize completed videos
2. **Check Failed Videos**: Review error messages for failed generations
3. **Use Search**: Find specific videos quickly in large lists
4. **Sort by Status**: Group videos by their current state

## Monitoring Your Usage

### Studio Page Indicators:
- Current generating videos count
- Daily usage progress
- Time until daily reset
- Visual ready/limit reached status

### My Videos Page:
- Total video counts by status
- Rate limit warnings when applicable
- Real-time status updates
- Visual progress indicators

This new system makes video generation much more efficient while providing better control and visibility over your video library! 