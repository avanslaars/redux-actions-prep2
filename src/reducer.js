import {
  getTodos,
  createTodo,
  updateTodo,
  destroyTodo
} from './lib/todoServices'
import { createActions, handleActions, combineActions } from 'redux-actions'

const initState = {
  todos: [],
  currentTodo: '',
  isLoading: true,
  message: ''
}

const UPDATE_CURRENT = 'UPDATE_CURRENT'
const ADD_TODO = 'ADD_TODO'
const LOAD_TODOS = 'LOAD_TODOS'
const REPLACE_TODO = 'REPLACE_TODO'
const REMOVE_TODO = 'REMOVE_TODO'
const SHOW_LOADER = 'SHOW_LOADER'
const HIDE_LOADER = 'HIDE_LOADER'

const fixCase = str => {
  return str.split('').reduce((acc, letter, idx) => {
    return idx === 0 ? letter.toUpperCase() : `${acc}${letter.toLowerCase()}`
  }, '')
}

export const {
  updateCurrent,
  loadTodos,
  addTodo,
  replaceTodo,
  removeTodo,
  showLoader,
  hideLoader
} = createActions(
  {
    UPDATE_CURRENT: fixCase,
    ADD_TODO: [x => x, (_, name) => ({ name })],
    SHOW_LOADER: () => true,
    HIDE_LOADER: () => false
  },
  LOAD_TODOS,
  REPLACE_TODO,
  REMOVE_TODO
)

export const fetchTodos = () => {
  return dispatch => {
    dispatch(showLoader())
    getTodos()
      .then(todos => {
        dispatch(loadTodos(todos))
        dispatch(hideLoader())
      })
      .catch(err => {
        dispatch(loadTodos(err))
        dispatch(hideLoader())
      })
  }
}

export const saveTodo = name => {
  return dispatch => {
    dispatch(showLoader())
    createTodo(name)
      .then(res => {
        dispatch(addTodo(res))
        dispatch(hideLoader())
      })
      .catch(err => {
        dispatch(addTodo(err, name))
        dispatch(hideLoader())
      })
  }
}

export const toggleTodo = id => {
  return (dispatch, getState) => {
    dispatch(showLoader())
    const { todos } = getState()
    const todo = todos.find(t => t.id === id)
    const toggled = { ...todo, isComplete: !todo.isComplete }
    updateTodo(toggled).then(res => {
      dispatch(replaceTodo(res))
      dispatch(hideLoader())
    })
  }
}

export const deleteTodo = id => {
  return dispatch => {
    dispatch(showLoader())
    destroyTodo(id).then(() => {
      dispatch(removeTodo(id))
      dispatch(hideLoader())
    })
  }
}

export const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case 'active':
      return todos.filter(t => !t.isComplete)
    case 'completed':
      return todos.filter(t => t.isComplete)
    default:
      return todos
  }
}

const reducer = handleActions(
  {
    ADD_TODO: {
      next: (state, action) => ({
        ...state,
        currentTodo: '',
        todos: state.todos.concat(action.payload)
      }),
      throw: (state, action) => ({
        ...state,
        message: `There was an error saving: ${action.meta.name}`
      })
    },
    LOAD_TODOS: {
      next: (state, action) => ({ ...state, todos: action.payload }),
      throw: (state, action) => ({
        ...state,
        message: 'There was an issue loading todos'
      })
    },
    UPDATE_CURRENT: (state, action) => ({
      ...state,
      currentTodo: action.payload
    }),
    REPLACE_TODO: (state, action) => ({
      ...state,
      todos: state.todos.map(
        t => (t.id === action.payload.id ? action.payload : t)
      )
    }),
    REMOVE_TODO: (state, action) => ({
      ...state,
      todos: state.todos.filter(t => t.id !== action.payload)
    }),
    [combineActions(SHOW_LOADER, HIDE_LOADER)]: (state, action) => ({
      ...state,
      isLoading: action.payload
    })
  },
  initState
)

export default reducer
