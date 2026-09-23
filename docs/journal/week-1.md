## Reflection Journal 
Week of: September 23, 2026
## My goal this week
Set up the initial project documentation, finalize the UI/UX design plans, prepare the repository structure, and begin backend development for the SkinTect application. 
## What I did
- Finalized the project proposal for SkinTect, a React platform app that provides informal skin lesion checks using a pre-trained ML model.
- Created detailed wireframes, including a screen map, box-sketches, and a component tree for the Login, Home, History, and Profile pages.
- Developed a design system utilizing Tailwind and shadcn/ui, mapping out color tokens (e.g., sage green for primary elements, teal for benign, red for malignant, etc), typography, and spacing rules.
- Researched backend infrastructure and decided to utilize Google Cloud and Supabase.
- Copied the template repository and established the base project structure.
## What blocked me
A major anticipated blocker identified during the planning phase is wiring the front end directly to the model inference. Specifically, ensuring that the generated heatmap aligns accurately on top of the user’s uploaded image remains a risk that depends on the model’s specific output formatting.
## What I learned
Through the planning and research phase, I learned how to systematically break down a full application into a component tree. I also determined the specific backend tech stack (Supabase and Google Cloud) needed to properly support the existing ML model integration and user database.
