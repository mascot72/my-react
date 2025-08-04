import React, { useState, useEffect } from 'react'
import {
  useFetchTodosQuery,
  useAddTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
} from '../features/user/apiSlice'

const TodoList: React.FC = () => {
  const { data: todos = [], isLoading, refetch } = useFetchTodosQuery()
  const [addTodo] = useAddTodoMutation()
  const [updateTodo] = useUpdateTodoMutation()
  const [deleteTodo] = useDeleteTodoMutation()
  const [newTodo, setNewTodo] = useState('')

  useEffect(() => {
    refetch() // 컴포넌트 마운트 시 데이터 조회
  }, [refetch])

  const handleAdd = async () => {
    if (newTodo.trim()) {
      await addTodo({ text: newTodo, completed: false })
      setNewTodo('')
    }
  }

  const handleToggle = async (id: number, completed: boolean) => {
    await updateTodo({ id, completed: !completed, text: todos.find((todo) => todo.id === id)?.text || '' })
  }

  const handleDelete = async (id: number) => {
    await deleteTodo(id)
  }

  if (isLoading) return <p>Loading...</p>

  return (
    <div>
      <h1>Space Missions</h1>
      <input type='text' value={newTodo} onChange={(e) => setNewTodo(e.target.value)} placeholder='Add a new task' />
      <button onClick={handleAdd}>Add</button>
      <table style={{ border: '1px', width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th>Mission</th>
            <th>Company</th>
            <th>Location</th>
            <th>Date</th>
            <th>Time</th>
            <th>Rocket</th>
            <th>Price</th>
            <th>Successful</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {todos.map((todo) => (
            <tr key={todo.id || todo.mission}>
              <td>{todo.mission || '-'}</td>
              <td>{todo.company || '-'}</td>
              <td>{todo.location || '-'}</td>
              <td>{todo.date || '-'}</td>
              <td>{todo.time || '-'}</td>
              <td>{todo.rocket || '-'}</td>
              <td>${todo.price?.toLocaleString() || '-'}</td>
              <td>{todo.successful ? 'Yes' : 'No'}</td>
              <td>
                {todo.text ? (
                  <>
                    {typeof todo.id === 'number' && (
                      <>
                        <button onClick={() => handleToggle(todo.id!, todo.completed ?? false)}>
                          {todo.completed ? 'Undo' : 'Complete'}
                        </button>
                        <button onClick={() => handleDelete(todo.id!)}>Delete</button>
                      </>
                    )}
                  </>
                ) : (
                  '-'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TodoList
