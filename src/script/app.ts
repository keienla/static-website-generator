// https://css-tricks.com/page-transitions-for-everyone/
// https://www.smashingmagazine.com/2016/07/improving-user-flow-through-page-transitions/

window.addEventListener('beforeunload', function() {
    document.body.classList.add('animate-out')
})

window.addEventListener('load', () => {
    console.log(new URL('/', window.location.href));
})