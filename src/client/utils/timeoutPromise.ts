const setTimeoutPromise = (delay: number) =>
  new Promise((resolve, reject) => {
    try {
      setTimeout(resolve, delay)
    } catch (error) {
      reject(error)
    }
  })

export { setTimeoutPromise as setTimeout }
