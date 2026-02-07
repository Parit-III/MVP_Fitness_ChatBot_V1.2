
  # Chat Bot with Authentication

  This is a code bundle for Chat Bot with Authentication. The original project is available at https://www.figma.com/design/V57SPVE4ZzLj3haBMnj667/Chat-Bot-with-Authentication.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  

```
MVP_Fitness_ChatBot_V1.2
├─ Backend
│  ├─ .env
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ routes
│  │  ├─ ai.js
│  │  └─ getRelevantContext.js
│  ├─ scripts
│  │  ├─ embedExercises.js
│  │  └─ firebaseAdmin.js
│  └─ server.js
├─ Frontend
│  ├─ .env
│  ├─ build
│  │  ├─ assets
│  │  │  ├─ index-CNomaQlj.css
│  │  │  └─ index-CVwTmMS-.js
│  │  └─ index.html
│  ├─ data
│  │  ├─ Exe.json
│  │  ├─ exercises_with_vectors.json
│  │  └─ GymBroButJson.json
│  ├─ dist
│  │  ├─ assets
│  │  │  ├─ index-BhjYWUQK.js
│  │  │  └─ index-CNomaQlj.css
│  │  └─ index.html
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ scripts
│  │  ├─ embeder.py
│  │  ├─ embedExercises.js
│  │  ├─ firebaseNode.ts
│  │  └─ seedExercises.ts
│  ├─ src
│  │  ├─ App.tsx
│  │  ├─ Attributions.md
│  │  ├─ components
│  │  │  ├─ AuthContext.tsx
│  │  │  ├─ AuthPage.tsx
│  │  │  ├─ Chatbot.tsx
│  │  │  ├─ Dashboard.tsx
│  │  │  ├─ EditExerciseModal.tsx
│  │  │  ├─ ExerciseDetail.tsx
│  │  │  ├─ ExerciseDetailModal.tsx
│  │  │  ├─ ExercisePlans.tsx
│  │  │  ├─ figma
│  │  │  │  └─ ImageWithFallback.tsx
│  │  │  ├─ ProfilePage.tsx
│  │  │  ├─ ui
│  │  │  │  ├─ accordion.tsx
│  │  │  │  ├─ alert-dialog.tsx
│  │  │  │  ├─ alert.tsx
│  │  │  │  ├─ aspect-ratio.tsx
│  │  │  │  ├─ avatar.tsx
│  │  │  │  ├─ badge.tsx
│  │  │  │  ├─ breadcrumb.tsx
│  │  │  │  ├─ button.tsx
│  │  │  │  ├─ calendar.tsx
│  │  │  │  ├─ card.tsx
│  │  │  │  ├─ carousel.tsx
│  │  │  │  ├─ chart.tsx
│  │  │  │  ├─ checkbox.tsx
│  │  │  │  ├─ collapsible.tsx
│  │  │  │  ├─ command.tsx
│  │  │  │  ├─ context-menu.tsx
│  │  │  │  ├─ dialog.tsx
│  │  │  │  ├─ drawer.tsx
│  │  │  │  ├─ dropdown-menu.tsx
│  │  │  │  ├─ form.tsx
│  │  │  │  ├─ hover-card.tsx
│  │  │  │  ├─ input-otp.tsx
│  │  │  │  ├─ input.tsx
│  │  │  │  ├─ label.tsx
│  │  │  │  ├─ menubar.tsx
│  │  │  │  ├─ navigation-menu.tsx
│  │  │  │  ├─ pagination.tsx
│  │  │  │  ├─ popover.tsx
│  │  │  │  ├─ progress.tsx
│  │  │  │  ├─ radio-group.tsx
│  │  │  │  ├─ resizable.tsx
│  │  │  │  ├─ scroll-area.tsx
│  │  │  │  ├─ select.tsx
│  │  │  │  ├─ separator.tsx
│  │  │  │  ├─ sheet.tsx
│  │  │  │  ├─ sidebar.tsx
│  │  │  │  ├─ skeleton.tsx
│  │  │  │  ├─ slider.tsx
│  │  │  │  ├─ sonner.tsx
│  │  │  │  ├─ switch.tsx
│  │  │  │  ├─ table.tsx
│  │  │  │  ├─ tabs.tsx
│  │  │  │  ├─ textarea.tsx
│  │  │  │  ├─ toggle-group.tsx
│  │  │  │  ├─ toggle.tsx
│  │  │  │  ├─ tooltip.tsx
│  │  │  │  ├─ use-mobile.ts
│  │  │  │  └─ utils.ts
│  │  │  ├─ VerifyEmail.tsx
│  │  │  └─ WorkoutLibrary.tsx
│  │  ├─ firebase.ts
│  │  ├─ guidelines
│  │  │  └─ Guidelines.md
│  │  ├─ hooks
│  │  │  └─ useAuth.ts
│  │  ├─ index.css
│  │  ├─ main.tsx
│  │  ├─ pages
│  │  │  └─ Dashboard.tsx
│  │  ├─ services
│  │  │  ├─ exerciseService.ts
│  │  │  ├─ planService.ts
│  │  │  └─ userService.ts
│  │  ├─ styles
│  │  │  └─ globals.css
│  │  └─ vite-env.d.ts
│  └─ vite.config.ts
├─ package-lock.json
└─ README.md

```