'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Home, CheckCircle, Undo2, Trash2, Settings, Play, Pause, Edit2, Moon, Sun, Clock, RotateCcw } from "lucide-react"
import ReactConfetti from 'react-confetti'
import { UserButton } from "@clerk/nextjs";

type Task = {
  id: number
  task: string
  completed: boolean
  timerRunning: boolean
  elapsedTime: number
  totalDuration: number
}

const Logo = () => {
  return (
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="url(#gradient)" />
      <path d="M20 10L24.5 18H15.5L20 10Z" fill="white" />
      <circle cx="20" cy="25" r="5" fill="white" />
      <defs>
        <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF4500" />
          <stop offset="1" stopColor="#FF8C00" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function TaskDashboardComponent() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, task: "Start the design system", completed: false, timerRunning: false, elapsedTime: 0, totalDuration: 0 },
    { id: 2, task: "Define a grid system", completed: false, timerRunning: false, elapsedTime: 0, totalDuration: 0 },
    { id: 3, task: "Establish a visual language", completed: false, timerRunning: false, elapsedTime: 0, totalDuration: 0 },
    { id: 4, task: "Curate a list of icon libraries", completed: false, timerRunning: false, elapsedTime: 0, totalDuration: 0 },
    { id: 5, task: "Create a color palette", completed: false, timerRunning: false, elapsedTime: 0, totalDuration: 0 },
    { id: 6, task: "Design primary UI components", completed: false, timerRunning: false, elapsedTime: 0, totalDuration: 0 },
    { id: 7, task: "Develop typography guidelines", completed: false, timerRunning: false, elapsedTime: 0, totalDuration: 0 },
    { id: 8, task: "Create user personas", completed: false, timerRunning: false, elapsedTime: 0, totalDuration: 0 },
    { id: 9, task: "Sketch wireframes for key pages", completed: false, timerRunning: false, elapsedTime: 0, totalDuration: 0 },
    { id: 10, task: "Plan user testing sessions", completed: false, timerRunning: false, elapsedTime: 0, totalDuration: 0 },
  ])
  const [removedTasksHistory, setRemovedTasksHistory] = useState<{ tasks: Task[], indices: number[] }[]>([])
  const [editingTask, setEditingTask] = useState<number | null>(null)
  const [pageTitle, setPageTitle] = useState("Product Design Tasks")
  const [editingTitle, setEditingTitle] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [newTaskName, setNewTaskName] = useState("")
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [confetti, setConfetti] = useState({ show: false, x: 0, y: 0 })
  const [dropdownKey, setDropdownKey] = useState(0)

  const toggleTaskCompletion = useCallback((id: number, checked: boolean) => {
    setTasks(tasks => tasks.map(task => {
      if (task.id === id) {
        const newCompleted = checked
        if (newCompleted) {
          setConfetti({ show: true, x: window.innerWidth / 2, y: window.innerHeight / 2 })
          setTimeout(() => setConfetti({ show: false, x: 0, y: 0 }), 2000)
        }
        return { ...task, completed: newCompleted }
      }
      return task
    }))
  }, [])

  const removeCompletedTasks = useCallback(() => {
    setTasks(tasks => {
      const completedTasks: Task[] = []
      const indices: number[] = []
      const updatedTasks = tasks.filter((task, index) => {
        if (task.completed) {
          completedTasks.push({ ...task, id: Date.now() + index }) // Generate a new unique ID
          indices.push(index)
          return false
        }
        return true
      })
      if (completedTasks.length > 0) {
        setRemovedTasksHistory(history => [...history, { tasks: completedTasks, indices }])
      }
      return updatedTasks
    })
  }, [])

  const undoChanges = useCallback(() => {
    if (removedTasksHistory.length > 0) {
      const lastRemoved = removedTasksHistory[removedTasksHistory.length - 1]
      setTasks(tasks => {
        const newTasks = [...tasks]
        lastRemoved.tasks.forEach((task, i) => {
          const restoredTask = { ...task, completed: false }
          newTasks.splice(lastRemoved.indices[i], 0, restoredTask)
        })
        return newTasks
      })
      setRemovedTasksHistory(history => history.slice(0, -1))
    }
  }, [removedTasksHistory])

  const editTask = useCallback((id: number) => {
    setEditingTask(id)
  }, [])

  const saveTask = useCallback((id: number, newTask: string) => {
    setTasks(tasks => tasks.map(task =>
      task.id === id ? { ...task, task: newTask } : task
    ))
    setEditingTask(null)
  }, [])

  const toggleTimer = useCallback((id: number) => {
    setTasks(tasks => tasks.map(task => {
      if (task.id === id) {
        if (task.timerRunning) {
          // Stopping the timer
          return { ...task, timerRunning: false, totalDuration: task.totalDuration + task.elapsedTime, elapsedTime: 0 }
        } else {
          // Starting the timer
          return { ...task, timerRunning: true, elapsedTime: 0 }
        }
      }
      return task
    }))
  }, [])

  const resetTimer = useCallback((id: number) => {
    setTasks(tasks => tasks.map(task =>
      task.id === id ? { ...task, elapsedTime: 0, totalDuration: 0, timerRunning: false } : task
    ))
  }, [])

  const createNewTask = useCallback(() => {
    if (newTaskName.trim()) {
      const newTask: Task = {
        id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
        task: newTaskName.trim(),
        completed: false,
        timerRunning: false,
        elapsedTime: 0,
        totalDuration: 0
      }
      setTasks(prevTasks => [newTask, ...prevTasks])
      setNewTaskName("")
      setIsCreatingTask(false)
    }
  }, [newTaskName, tasks])

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev)
  }, [])

  const handleCreateNewTaskClick = useCallback(() => {
    setIsCreatingTask(true)
    setDropdownKey(prevKey => prevKey + 1)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(tasks => tasks.map(task =>
        task.timerRunning ? { ...task, elapsedTime: task.elapsedTime + 1 } : task
      ))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date())
    }, 60000) // Update every minute

    return () => {
      clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  }

  const completedTasksCount = tasks.filter(task => task.completed).length
  const totalTime = tasks.reduce((total, task) => total + task.totalDuration + (task.timerRunning ? task.elapsedTime : 0), 0)

  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? 'dark' : ''}`}>
      <style jsx global>{`
        .dark body {
          background-color: #131316;
          color: #ffffff;
        }
        .dark .bg-background {
          background-color: #131316;
        }
        .dark .bg-card {
          background-color: #1D1D20;
        }
      `}</style>
      {confetti.show && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={50}
          recycle={false}
          confettiSource={{
            x: confetti.x,
            y: confetti.y,
            w: 10,
            h: 10
          }}
        />
      )}
      {/* Updated Navigation */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-background text-foreground">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Logo />
            <span className="text-xl font-bold">Trakr</span>
          </div>
          <div className="flex items-center space-x-4">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-10 w-10"
                }
              }}
            />
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-8 bg-background text-foreground overflow-auto">
        <div className="container mx-auto">
          <header className="flex justify-between items-center mb-8">
            <div>
              {editingTitle ? (
                <Input
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  onBlur={() => setEditingTitle(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setEditingTitle(false)
                    }
                  }}
                  className="text-2xl font-bold h-auto py-0 px-1"
                  autoFocus
                />
              ) : (
                <h1
                  className="text-2xl font-bold cursor-pointer flex items-center"
                  onClick={() => setEditingTitle(true)}
                >
                  {pageTitle}
                  <Edit2 className="h-4 w-4 ml-2 text-muted-foreground" />
                </h1>
              )}
              <p className="text-muted-foreground">{formatDate(currentDate)}</p>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={undoChanges}
                disabled={removedTasksHistory.length === 0}
              >
                <Undo2 className="h-4 w-4 mr-2" /> Undo changes
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={removeCompletedTasks}
                disabled={completedTasksCount === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Remove completed ({completedTasksCount})
              </Button>
              <DropdownMenu
                key={dropdownKey}
                open={isCreatingTask}
                onOpenChange={(open) => {
                  setIsCreatingTask(open)
                  if (!open) {
                    setNewTaskName("")
                  }
                }}
              >
                <DropdownMenuTrigger asChild>
                  <Button size="sm" onClick={handleCreateNewTaskClick}>
                    <Plus className="h-4 w-4 mr-2" /> Create new task
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <div className="p-2">
                    <Input
                      placeholder="Enter task name"
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          createNewTask()
                        }
                      }}
                      autoFocus
                    />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Dashboard Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card className="bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Home className="h-4 w-4 mr-2 text-blue-500" />
                  Total Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tasks.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Completed Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedTasksCount}</div>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-indigo-500" />
                  Total Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatTime(totalTime)}</div>
              </CardContent>
            </Card>
          </div>

          <ScrollArea className="h-[calc(100vh-350px)]">
            {tasks.map((item) => (
              <div key={item.id} className="py-4 border-b border-gray-200 dark:border-gray-800 last:border-b-0">
                <div className="flex items-center">
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={(checked) => toggleTaskCompletion(item.id, checked as boolean)}
                    className="mr-4"
                  />
                  {editingTask === item.id ? (
                    <div className="flex-grow">
                      <Input
                        defaultValue={item.task}
                        className="w-full"
                        autoFocus
                        onBlur={(e) => saveTask(item.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            saveTask(item.id, e.currentTarget.value)
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex-grow flex items-center justify-between">
                      <div
                        className={`font-medium ${item.completed ? 'line-through text-muted-foreground' : ''} cursor-pointer`}
                        onClick={() => editTask(item.id)}
                      >
                        {item.task}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {formatTime(item.totalDuration + (item.timerRunning ? item.elapsedTime : 0))}
                        </span>
                        {(item.totalDuration > 0 || item.elapsedTime > 0) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resetTimer(item.id)}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleTimer(item.id)}
                        >
                          {item.timerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                {!item.timerRunning && item.totalDuration > 0 && (
                  <div className="text-xs text-muted-foreground mt-1 ml-10">
                    Total time: {formatTime(item.totalDuration)}
                  </div>
                )}
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}