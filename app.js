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
        this.questions = res.results.reduce((acc, obj) => {
          acc.push({
              "category": obj.category,
              "type": obj.type,
              "difficulty": obj.difficulty,
              "question": obj.question,
              optionsCheck: () => {
                let optionsObject = {}
                obj.incorrect_answers.forEach(option => {
                  if(/&#?[a-z0-9]+;/.test(option)) {
                    let validString = option.replace(/&#?[a-z0-9]+;/g, "'")
                    optionsObject[validString] = "incorrect"
                  } else {
                    optionsObject[option] = "incorrect"
                  }
                })
                // '&dagger'.match(/&#?[a-z0-9]+/g)
                if(/&#?[a-z0-9]+;/.test(obj.correct_answer)) {
                  let validString = obj.correct_answer.replace(/&#?[a-z0-9]+;/g, "'")
                  optionsObject[validString] = "correct"
                } else {
                  optionsObject[obj.correct_answer] = "correct"
                }
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
    "Film": 11,
    "Music": 12,
    "Science": 17,
    "Computers": 18,
    "History": 23,
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
    const currentCount = document.querySelector('.current-count')
    const options = document.querySelector('.options')
    const choices = document.querySelector('.choices')
    const button = document.querySelector('.form-button')
    const next = document.querySelector('.next')
    const quit = document.querySelector('.quit')
    const score = document.querySelector('.score')
    return {
      userProfile,
      username,
      category,
      difficulty,
      rootDiv,
      currentCategory,
      currentQuestion,
      currentCount,
      options,
      choices,
      button,
      next,
      quit,
      score
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

    displayQuestion: (question, category, options) => {
      console.log(question)

      DOMStrings().currentQuestion.innerHTML = question
      DOMStrings().currentCategory.innerHTML = category
      DOMStrings().choices.innerHTML = options
    },
    displayUser: (element, {username, category, difficulty, avatar}) => {
      const userMarkup = `
      <div class="username-img">
      <div class="avatar"><img style="width: 100%" src="${avatar}" alt="user image"></div>
      <h2>${username}</h2>
      </div>
      <div class="bio">
        <p class="user-category"><small>category:</small> ${category}</p></br>
        <p class="dfct"><small>Difficulty:</small> ${difficulty}</p></br>
        <p class="sc"><small>Score:</small> <span class="score">0/20</span></p>
      </div>
      `
      element.insertAdjacentHTML('afterbegin', userMarkup)
    },
    updateScore: (score) => {
      DOMStrings().score.innerText = `${score}/20`
    },
    updateCount: (count) =>  {
      DOMStrings().currentCount.innerText = count
    },
    renderLoader,
    createOptionsMarkup: options => {
      let markUp = ``
      options.forEach(option => markUp = markUp.concat(`<div class="option"><p>${option}</p></div>`))
      return markUp
    },
    endPage: (score) => {
      const endPage = `
      <div class="end slide-in-top">
        <h1 class="end-h1">END GAME</h1>
        <p class="final-score">SCORE: ${score}</p>
        <a class="link-btn" role="button" href="index.html">play again</a>
      </div>
      `
      DOMStrings().rootDiv.innerHTML = endPage
    }
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
      setUpEventListeners(DOM().button, getQuestions)
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
  function setUpEventListeners(elm, callback) {
    elm.addEventListener('click', callback)
  }

  function formatNumber(number) {
    let str = number.toString()
    if(str.length < 2) {
      str = '0' + str
    }

    return str
  }

  //GET USER
  function setUser(username, category, difficulty) {
    const user = modelCtrl.createNewUser(username, category, difficulty)
    UICtrl.displayUser(DOM().userProfile, user)

  }

  // GET QUESTIONS
  async function getQuestions() {
    if(DOM().username.value) {
      const username = DOM().username.value
      const category = DOM().category.value
      const categoryId = modelController.quiz_categories[DOM().category.value]
      const difficulty = DOM().difficulty.value.toLowerCase()
      //render loader
      const newQuestions = modelCtrl.createQuestions(categoryId, difficulty)
      UICtrl.renderLoader(document.querySelector('.home-container'))
      await newQuestions.getQuestions()
      const allQuestions = await newQuestions.questions
      if(allQuestions) {
        console.log(allQuestions)
        onNavigate('/quiz')
        // next(allQuestions)()
        UICtrl.displayQuestion(allQuestions[0].question, allQuestions[0].category, UICtrl.createOptionsMarkup(allQuestions[0].options()))
        setUser(username, category, difficulty)
        setUpEventListeners(DOM().options, validateAnswer(allQuestions[0].question, allQuestions[0].optionsCheck()))
        setUpEventListeners(DOM().next, next(allQuestions))
        setUpEventListeners(DOM().quit, quit)
        
      }
      return allQuestions
      }
    alert('Please enter a valid username')
  }

  let score = 0
  function validateAnswer(question, checkCorrectness) {
    let checked = false  //Hoisting 😜
    
    const options = new Array(...document.querySelectorAll('.option'))
    function event(e) {
      const element = e.target.closest('.option')
      if(element && checked !== true) {
        const choice = element.childNodes[0].textContent
        if(checkCorrectness[choice] === 'correct'){
          element.classList.add('correct')
          score +=1
          console.log(score)
          UICtrl.updateScore(score)
        }else {
          element.classList.add('incorrect')
          options.forEach(elm => {
            console.log(elm.childNodes[0])
            if(checkCorrectness[elm.childNodes[0].textContent] === 'correct') {
              elm.classList.add('correct')
            }
          })
        } 
        checked = true
      }
    }
    return event
  }

  function next(questions) {
    let count = 1

    return () => {
      if(DOM().next.textContent !== 'finish') {
        if(count !== questions.length) {
          let currentQuestion = questions[count].question
          let currentCategory = questions[count].category
          let currentOptions = questions[count].options()
          let checkCorrectness = questions[count].optionsCheck()
          UICtrl.displayQuestion(currentQuestion, currentCategory, UICtrl.createOptionsMarkup(currentOptions))
          UICtrl.updateCount(formatNumber(count + 1))
          setUpEventListeners(DOM().options, validateAnswer(currentQuestion, checkCorrectness))
          
          count += 1
          console.log(count)
        }
        if(count === 20) {
          DOM().next.textContent = 'finish'
        }
      } else {
        UICtrl.endPage(score + '/' + count)
      }
    }
    
  }

  function quit() {
    const res = confirm('Are you sure you want to quit this game? \nall your progress will be lost')
    if(res) {
      window.location.replace('http://127.0.0.1:5500/index.html')
    }
  }

  return {
    init: () => {
      console.log('application has started')
      mountWindow()
      setUpEventListeners(DOM().button, getQuestions)
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



