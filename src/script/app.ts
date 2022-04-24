window.addEventListener('beforeunload', function() {
    const TEST: string = 'TEST'
    console.log(TEST);
    document.body.classList.add('animate-out')
})