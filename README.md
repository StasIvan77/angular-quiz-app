# QuizzesApp  

QuizzesApp is an application designed for answering questions and reviewing progress through quizzes. This project was developed as part of a Front-End Engineer Internship test task.  

## Features  

### User Stories  
- **Home Page**  
  - Displays a list of dynamically generated quizzes (10 quizzes upon app initialization).  
  - Shows quiz information: name, number of questions, and a "Play" button.  
  - Includes an "I'm lucky" button to select a random quiz.  

- **Play Page**  
  - Allows users to answer questions from the selected quiz.  
  - Prevents navigation to the next question until an answer is chosen.  
  - Includes the option to cancel the quiz and return to the Home Page.  

- **Finish Page**  
  - Displays quiz results, including:  
    - Total points scored.  
    - Number of correct answers.  
    - Time taken.  
    - Two additional statistical options (custom).  

### Functional Requirements  
- Dynamically fetches questions from an external API to create quizzes.  
- Fully responsive design for mobile and desktop devices.  

### Bonus Points (Implemented)  
- Usage of **signals** for state management.  
- Store pattern using a custom implementation.  
- Integration of Angular Material for UI components.  
- Tailwind CSS for styling alongside SCSS for preprocessing.  
- Unit tests for services and components.  

### Technologies  
- **Framework**: Angular (v18.2.3).  
- **Styling**: Tailwind CSS, SCSS.  
- **UI Library**: Angular Material.  
- **API**: Open Trivia Database (or similar).  
- **Version Control**: GitHub.  
- **Hosting**: [Deployed on Netlify/Vercel/GitHub Pages](#) (insert link).  

## Installation  

1. Clone the repository:  
   ```bash  
   git clone https://github.com/your-repo/quizzes-app.git  
   cd quizzes-app  
2. Install dependencies:
npm install  
3. Run the development server:
ng serve  
Navigate to http://localhost:4200/.


## API Usage
This application fetches quiz data from the Open Trivia Database API. The API response includes:
- category, type, difficulty, question, correct_answer, incorrect_answers.

## Сontribution
This project was created as part of an internship assignment and is not open for contributions at this time.

## Author
Ivan Stasiv
