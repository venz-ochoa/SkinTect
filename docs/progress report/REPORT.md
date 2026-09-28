## Weekly Increment Report 
Week of: September 23, 2026
## What changed this week
- Finalized the project proposal for "Skin Tect," an application for informally identifying skin lesions.
- Designed the application wireframes, including a screen map, box-sketches, and a component.
- Created a design layout utilizing Tailwind and shadcn/ui, which details color tokens, type scale, spacing rules, and reusable components.
- Initialized the project repository by copying the template. 
- Researched and selected Google Cloud and Supabase for the backend and database architecture.
## Why
- These changes were necessary to establish the foundational documentation, UI/UX design rules, and repository structure before initiating active backend and frontend coding.
What broke or what I got stuck on
- I am currently researching an anticipated problem: wiring the React frontend to the machine learning model inference. I’m trying to see how to ensure that the generated heatmap aligns accurately on top of the user's uploaded image, which heavily depends on the specific format of the model's output.
## What is left
- Coding the backend infrastructure (starting this week) using Google Cloud and Supabase.
- Building the React frontend platform and applying the design system.
- Integrating the pre-trained Machine Learning model with the React and database layers.
- Developing the core application features, including image upload functionality, user authentication, and the scan history log.

## Weekly Increment Report 
Week of: September 28, 2026
## What changed this week
- Finished setting up server-side (model) inference via Google Cloud
- Developed initial prototype (no database integration yet. Purely model)
- Conducted testings to ensure model and system integration worked properly (SSH, Cloud Shell, WebApp)
## Why
- Establishing the Google Cloud was needed since it provided the compute power required for the ML model to analyze the uploaded images in real time
- Building the prototype without a database allows me to focus strictly on the code end-to-end pipeline (React front-end can send images and parse the model json results).
- Cross-platform testing was critical to identify and resolve any API communication problems, like the 400 Bad Request which was due to an invalid image upload.
## What is left
- Database integration
- User authentication
- UI/UX Polish
