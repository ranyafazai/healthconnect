# Video Tutorial Setup Guide

## How to Make the Video Work in HowItWorks Page

### Current Status
The video section currently shows a placeholder because the actual video files don't exist yet. Once you add your video files, the page will automatically display the working video player.

### Step-by-Step Setup

#### 1. Create Your Tutorial Video
Create a video tutorial covering these topics:
- **Sign up & sign in process** (0:30-2:00)
- **Finding & booking doctors** (2:00-3:30)
- **Appointment booking** (3:30-5:00)
- **Video consultation process** (5:00-7:00)
- **Messaging and reviews** (7:00-8:30)
- **Managing appointments** (8:30-9:30)
- **Conclusion** (9:30-10:00)

#### 2. Export Your Video
- **Format**: MP4 (H.264) - best compatibility
- **Resolution**: 1920x1080 (Full HD) or higher
- **Duration**: 8-12 minutes recommended
- **File size**: Keep under 100MB for web
- **Audio**: Clear narration explaining each step

#### 3. Add Video Files to Your Project
1. Navigate to your project folder: `frontend/public/`
2. Add your video file: `healthconnect-tutorial.mp4`
3. Add a thumbnail image: `video-thumbnail.jpg`

#### 4. File Structure
```
frontend/
├── public/
│   ├── healthconnect-tutorial.mp4    ← Your video file
│   ├── video-thumbnail.jpg           ← Thumbnail image
│   └── ... (other public files)
└── src/
    └── layout/
        └── LandingLayout/
            └── HowItWorks.tsx        ← Updated component
```

#### 5. How It Works
The updated code automatically:
- Tries to load your video file
- If the video loads successfully → Shows the video player
- If the video fails to load → Shows the placeholder with instructions
- Includes error handling to gracefully fall back to the placeholder

#### 6. Video Content Suggestions
Your tutorial should demonstrate:
- **Real user interface** of your HealthConnect platform
- **Step-by-step navigation** through key features
- **Actual examples** of booking appointments, video calls, etc.
- **Clear narration** explaining each step
- **Common user scenarios** and how to handle them

#### 7. Testing
After adding your video:
1. Refresh the "How It Works" page
2. The video player should automatically appear
3. Test video controls (play, pause, volume, etc.)
4. Test on different devices and browsers

#### 8. Troubleshooting
If the video still doesn't work:
- Check file path: `/healthconnect-tutorial.mp4`
- Verify file format is MP4 (H.264)
- Check file size is under 100MB
- Ensure file is in the `public` folder
- Check browser console for errors

### Video Requirements Summary
- **Format**: MP4 (H.264)
- **Resolution**: 1920x1080+
- **Duration**: 8-12 minutes
- **File size**: <100MB
- **Content**: Step-by-step tutorial with narration
- **Location**: `frontend/public/healthconnect-tutorial.mp4`

### What Happens Next
Once you add your video file:
1. The placeholder will automatically disappear
2. The video player will show with your tutorial
3. Users can watch the full tutorial directly on the page
4. The "Watch Full Tutorial" button will work properly

The video section is now fully functional and will automatically detect when you add your tutorial video!
