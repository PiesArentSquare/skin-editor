<nav>
    <div class="inner">
        <input type="checkbox" id="hamburger-toggle"/>
        <label for="hamburger-toggle">
            <div class="hamburger"></div>
        </label>
        <ul>
            <li id="new">new</li>
            <li id="open">open</li>
            <li id="save">save</li>
        </ul>
        <h1>untitled*</h1>
    </div>
</nav>

<style lang="scss">
    @use 'src/styles/common';

    nav {
        background-color: white;
        padding: 0.5rem 2rem;
        box-shadow: common.$shadow;
        z-index: 1;
    }
    
    .inner {
        position: relative;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
    }

    label {
        display: flex;
        height: 100%;
    }

    input {
        display: none;
    }

    .hamburger,
    .hamburger::before,
    .hamburger::after {
        align-self: center;
        content: '';
        position: absolute;
        display: block;
        width: 25px;
        height: 2px;
        border-radius: 2px;
        background-color: common.$secondary-color;
    }

    .hamburger::before {
        margin-top: -8px;
        width: 20px;
    }

    .hamburger::after {
        margin-top: 8px;
        width: 15px;
    }

    ul {
        display: none;
        position: absolute;
        flex-direction: column;
        top: calc(100% + .5rem);
        left: -2rem;
        width: 100%;
        padding: .5rem 2rem;
        background-color: white;
    }
    
    #hamburger-toggle:checked ~ ul {
        display: flex;
    }

    #hamburger-toggle:checked ~ label .hamburger::before {
        margin-top: 0;
        transform: rotate(45deg);
        width: 25px;
    }

    #hamburger-toggle:checked ~ label .hamburger::after {
        margin-top: 0;
        transform: rotate(-45deg);
        width: 25px;
    }

    #hamburger-toggle:checked ~ label .hamburger {
        background-color: rgba(0,0,0,0);
    }

    li {
        margin-block: 0.5rem;
    }

    h1 {
        justify-self: center;
        font-size: 1rem;
        font-weight: 400;
    }

    @media (min-width: 800px) {
        label, .hamburger {
            display: none;
        }

        .inner {
            justify-content: start;
        }

        ul {
            display: flex;
            position: static;
            flex-direction: row;
            padding: 0;
        }

        li {
            margin-block: 0;
            margin-right: 2rem;
        }
    }
</style>