## Reflection Journal 
Week of: September 28, 2026
## My goal this week
Set up the online inference for the model (Google Cloud), develop an initial prototype (Basic upload-result function, simple interface).
## What I did
- Set up everything in Google Cloud, did testing to make sure the model and related scripts (model.py, api.py) worked
- Coded simple prototype (upload-result), did testing within the web app to verify the model works outside Cloud Shell, verified using VM SSH
- Completed week 2 AI-Usage
## What blocked me
Initially, it was starting and initializing the Google Cloud that took the longest. Another thing is that I was stuck in the loading results state, and I found out that the image itself was invalid or corrupted. Will add a safeguard to that in Week 3.
## What I learned
Do not let AI go rampant over your code, as it might edit portions you didn't intend it to do (see error case 2 and 3). Front-end was more readable than expected, and integrating React with the Model API was surprisingly easy after much research. It tackled the same concepts and procedures as what we did in AWS.
