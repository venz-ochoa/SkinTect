# AI usage

This project was built with AI assistance. This file is the record of it. It is
graded as the finals badge, and it is worth 100 points.

Start it in week 1 and keep it up as you go. The commit history of this file is
part of the evidence: a file written all at once the night before the deadline
looks exactly like what it is.

## Week 1 (To add)

## 1. How I used AI

At least six entries. One per real use. Every entry needs a commit link.

### YYYY-MM-DD - short title

- **Tool:**
- **What I asked for:**
- **What it gave back:**
- **What I kept, what I changed, and why:**
- **Commit:** https://github.com/YOUR-USERNAME/YOUR-REPO/commit/SHA

## 2. Where the AI got it wrong

Three cases. Be specific. If you write that the AI was never wrong, this section
scores zero.

### Case 1 - short title

- **What it gave me:**
- **What was wrong with it:**
- **What I did instead:**
- **Commit:** https://github.com/YOUR-USERNAME/YOUR-REPO/commit/SHA

## 3. Who wrote what

At least a fifth of this project is code you wrote yourself. Name it, and explain
it in your own words.

> Group projects: give each member their own heading below, and use your GitHub
> handle as the heading. You are graded on your own section.

### Written by me

- **File:**
- **Commit:**
- **What it does and why it is built this way:**

### The AI-written part I understand best

- **File:**
- **Commit:**
- **What it does and why we kept it:**



## Week 2

## 1. How I used AI

### 2026-09-28 - Basic Frontend Prototype

- **Tool:** Claude (claude.ai)
- **What I asked for:** The simplest front-end for the React page. I already created the code to upload or take a photo of the lesion and the displaying of results. No database integration for now, testing if the connection and setup in Google Cloud works with what I made.
- **What it gave back:** App.jsx with an upload/take a photo button, a preview, an analysze button, and the displaying of results underneath.
- **What I kept, what I changed, and why:** I changed the sample code pasted and used it as a guide for developing today's progress.
- **Commit:** https://github.com/venz-ochoa/SkinTect/commit/1818a8cbaa6cb963fcd7cb32ff436d20e6b996b9

## 2. Where the AI got it wrong

- **Error 2** The generated requirements.txt in Google Cloud installed CUDA build of pyTorch, which took up a massive amount of space, and my disk ended up running out. I had to explicitly add exclusions or work arounds.
- **Error 3** - Misunderstood model preprocessing, constantly getting the sizing wrong by guessing 380x380 as the size and assuming I didn't use OpenCV and Pillow (I didn't upload the code I did, hence the mistake).

### Case 1 - Unintentional rewriting of unspecified code

- **What it gave me:** Basic front-end prototype for the back-end code I did, basic buttons, results panel, and image preview
- **What was wrong with it:** Ended up doing that plus rewriting my back-end code without my permission, and ended up complicating the initial prototype since it fully fleshed out my code without context, which caused errors for the app. 
- **What I did instead:** Explicitly asked to leave the non-front code untouched, and to prevent unstated revisions. I had to type the back-end code again and include more restrictive instructions for further prompts.
- **Commit:** https://github.com/venz-ochoa/SkinTect/commit/1818a8cbaa6cb963fcd7cb32ff436d20e6b996b9

### Case 2 - Fake Results

- **What it gave me:** Front-end code prototype now integrating with updated non mockup code but with randomized math for the confidence score
- **What was wrong with it:** I was confused since results didn't match separate model testing. Turns out, the generated code just displayed a randomized number from 0-100.
- **What I did instead:** Explicitly asked to integrate what I did to the front-end, so now it displays based on the returned json of the model.
- **Commit:** https://github.com/venz-ochoa/SkinTect/commit/1818a8cbaa6cb963fcd7cb32ff436d20e6b996b9

### Case 3 - Added an out-of-scope class for results

- **What it gave me:** Front-end with a separate display for the 'unclassified class'
- **What was wrong with it:** The model only has two classes: benign and malignant. It does not handle out-of-scope or non-lesion images. It expects inputs of skin lesions, if not, will return best-match predictions.
- **What I did instead:** Removed all code related for the unclassified classifications.
- **Commit:** https://github.com/venz-ochoa/SkinTect/commit/1818a8cbaa6cb963fcd7cb32ff436d20e6b996b9

## 3. Who wrote what 
- **User Written** pickFile(), analyze().
- **AI-Generated** front end for basic protytpe (testing purposes).

### Written by me

- **File:** App.jsx (back-end portion)
- **Commit:** https://github.com/venz-ochoa/SkinTect/commit/1818a8cbaa6cb963fcd7cb32ff436d20e6b996b9
- **What it does and why it is built this way:** pickFile() is a function that lets users upload or take a photo (mobile), and updates the states (file). analyze() is the one doing all the work, appends the image to a new object so it can be sent to the server, waits and parses result into a json, then updates the states (result).

### The AI-written part I understand best

- **File:** App.jsx (front-end portion)
- **Commit:** https://github.com/venz-ochoa/SkinTect/commit/1818a8cbaa6cb963fcd7cb32ff436d20e6b996b9
- **What it does and why we kept it:** Just displays a very basic, skeleton-like, interface solely for uploading an image and generating a response. Due to it being extremely basic, it was easily understandable. Will keep for now for more testing and integration with the database and user logins.