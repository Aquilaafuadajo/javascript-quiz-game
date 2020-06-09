// MODEL CONTROLLER

const modelController = (function() {
  class Questions {
    constructor(category, difficulty) {
      this.category = category
      this.difficulty = difficulty
      this.count = 0
    }

    async getQuestions() {
      try {
        const res = await (await fetch(`https://opentdb.com/api.php?amount=20&category=${this.category}&difficulty=${this.difficulty}`)).json()
        this.questions = res
        this.test = res.results.reduce((acc, obj) => {
          acc.push({
              "category": obj.category,
              "type": obj.type,
              "difficulty": obj.difficulty,
              "question": obj.question,
              optionsCheck: () => {
                let optionsObject = {}
                obj.incorrect_answers.forEach(option => optionsObject[option] = "incorrect")
                optionsObject[obj.correct_answer] = "correct"
                return optionsObject
              },
              options: () => {
                let options = obj.incorrect_answers
                options.splice(Math.floor(Math.random()*options.length), 0, obj.correct_answer)
                return options
              }
          })
          return acc
        }, [])
        console.log(this.test)
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
      this.avatar = `https://avatars.dicebear.com/api/bottts/${this.username}.svg`
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
      return new Questions(ctg, dft)
    },
    createNewUser: (username, category, difficulty) => {
      return new User(username, category, difficulty)
    },
    quiz_categories,
  }
})()


// UI CONTROLLER
const UIController = (function() {
  const DOMStrings = () => {
    const rootDiv = document.getElementById('root')
    const userProfile = document.querySelector('.user-profile')
    const username = document.querySelector('.form-input')
    const category = document.getElementById('category')
    const difficulty = document.getElementById('difficulty')
    const currentCategory = document.querySelector('.current-category')
    const currentQuestion = document.querySelector('.current-question')
    const options = document.querySelector('.answers')
    const button = document.querySelector('.form-button')
    return {
      userProfile,
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

  const renderLoader = element => {
    const loader = `
    <div class="spinner">
      <div class="overlay"></div>
      <div class="fulfilling-bouncing-circle-spinner">
        <div class="circle"></div>
        <div class="orbit"></div>
      </div>
    </div>
    `
    element.insertAdjacentHTML('afterbegin', loader)
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

    displayQuestion: question => {
      console.log(question)
      let optionsMarkUp = (option) => `<div class="option"><p>${option}</p></div>`
      DOMStrings().currentQuestion.innerHTML = question[0].question
      DOMStrings().currentCategory.innerHTML = question[0].category
      question[0].options().forEach(option => DOMStrings().options.insertAdjacentHTML('afterbegin', optionsMarkUp(option)))
    },

    displayUser: (element, {username, category, difficulty, avatar}) => {
      const userMarkup = `
      <div class="avatar"><img style="width: 100%" src="${avatar}" alt="user image"></div>
      <div class="bio">
        <h2>${username}</h2>
        <p><small>category:</small> ${category}</p></br>
        <p><small>Difficulty:</small> ${difficulty}</p></br>
        <p><small>Best score:</small> 18/20</p></br>
        <p><small>Score:</small> 08/20</p>
      </div>
      `
      element.insertAdjacentHTML('afterbegin', userMarkup)
    },
    renderLoader
  }

})()


// APP CONTROLLER
const controller = (function(modelCtrl, UICtrl) {
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

  //GET USER
  function setUser(username, category, difficulty) {
    const user = modelCtrl.createNewUser(username, category, difficulty)
    UICtrl.displayUser(DOM().userProfile, user)

  }

  // GET QUESTIONS
  async function getQuestions() {
    const username = DOM().username.value
    const category = DOM().category.value
    const categoryId = modelController.quiz_categories[DOM().category.value]
    const difficulty = DOM().difficulty.value.toLowerCase()
    //render loader
    const newQuestions = modelCtrl.createQuestions(categoryId, difficulty)
    UICtrl.renderLoader(document.querySelector('.home-container'))
    await newQuestions.getQuestions()
    const allQuestions = await newQuestions.test
    if(allQuestions) {
      onNavigate('/quiz')
      UICtrl.displayQuestion(allQuestions)
      setUser(username, category, difficulty)
    }
    return allQuestions
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