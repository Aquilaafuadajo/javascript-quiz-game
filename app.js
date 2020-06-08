// MODEL CONTROLLER

const modelController = (function() {
  class Question {
    constructor(category, difficulty) {
      this.category = category
      this.difficulty = difficulty
      this.count = 0
    }

    async getQuestions() {
      try {
        const res = await (await fetch(`https://opentdb.com/api.php?amount=20&category=${this.category}&difficulty=${this.difficulty}`)).json()
        this.questions = res
        console.log(res)
      }catch(err) {
        console.log(err)
      }
    }
    
    getCurrentQuestion() {
      let question = this.questions[this.count]
      this.count += 1
      return question
    }
  }

  class User {
    constructor(username, category, difficulty) {
      this.username = username
      this.category = category
      this.difficulty = difficulty
    }
    //Best score: 
  }

  const quiz_categories = {
    "General Knowledge": 9,
    "Science": 17,
    "Sports": 21,
    "History": 23,
    "Politics": 24,
    "Celebrities": 26,
  }

  return {
    createQuestions: (ctg, dft) => {
      return new Question(ctg, dft)
    },
    createNewUser: (username, category, difficulty) => {
      return new User(username, category, difficulty)
    },
    quiz_categories
  }
})()


// UI CONTROLLER
const UIController = (function() {
  const DOMStrings = () => {
    const rootDiv = document.getElementById('root')
    const username = document.querySelector('.form-input')
    const category = document.getElementById('category')
    const difficulty = document.getElementById('difficulty')
    const currentCategory = document.querySelector('.current-category')
    const currentQuestion = document.querySelector('.current-question')
    const options = document.querySelector('.answers')
    const button = document.querySelector('.form-button')
    return {
      username,
      category,
      difficulty,
      rootDiv,
      currentCategory,
      currentQuestion,
      options,
      button
    }
  }

  const routes =  {
    '/index.html': homeMarkup,
    '/quiz': quizMarkUp
  }

  return {
    getRoutes: () => routes,
    getDOMStrings: () => DOMStrings,
    getUserInfo: () => {
      return {
        username: DOMStrings().username.value,
        category: DOMStrings().category.value,
        difficulty: DOMStrings().difficulty.value
      }
    },
    renderQuestion: question => {
      console.log(DOMStrings().currentQuestion)
      // let optionsMarkUp = (option) => `<div class="option"><p class="test">${option}</p></div>`
      // DOMStrings().currentQuestion.innerHTML = question.question
      // DOMStrings().currentCategory.innerHTML = question.category
      // question.incorrect_answers.forEach(option => DOMStrings().options.insertAdjacentHTML('afterbegin', optionsMarkUp(option)))
    }
  }

})()


// APP CONTROLLER
const controller = (function(questionCtrl, UICtrl) {
  const DOM = UICtrl.getDOMStrings()

  /**************ROUTER*****************/ 
  // MOUNT WINDOW
  function mountWindow() {
    document.getElementById('root').innerHTML = UICtrl.getRoutes()['/index.html'];
  }

  // UNMOUNT WINDOW
  function unmountWindow() {
    window.onpopstate = () => {
      DOM().rootDiv.innerHTML = UICtrl.getRoutes()[window.location.pathname]
      setUpEventListeners()
    }
  }

  //CONTROL NAVIGATIONS
  function onNavigate(pathname) {
    window.history.pushState(
      {},
      pathname,
      window.location.origin + pathname
    )
    DOM().rootDiv.innerHTML = UICtrl.getRoutes()[pathname]
  }

  /*********APP CONTROLS*********/
  function setUpEventListeners() {
    DOM().button.addEventListener('click', getQuestions)
  }

  async function getQuestions() {
    const categoryId = modelController.quiz_categories[DOM().category.value]
    const difficulty = DOM().difficulty.value.toLowerCase()
    //render loader
    const question = questionCtrl.createQuestions(categoryId, difficulty)
    // await question.getQuestions()
    onNavigate('/quiz')
    return question
  }

  return {
    init: () => {
      console.log('application has started')
      mountWindow()
      setUpEventListeners()
      unmountWindow()
    },
    onNavigate: () => onNavigate
  }

})(modelController, UIController)

controller.init()



// const routes = {
//   '/index.html': home,
//   '/quiz': markUp
// }

// const rootDiv = document.getElementById('root');
// console.log(rootDiv)
// rootDiv.innerHTML = routes[window.location.pathname];






// document.querySelector('.form-button').addEventListener('click', () => onNavigate('/quiz'))