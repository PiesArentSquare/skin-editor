<nav>
    <div class="inner">
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
        color: common.$secondary-color;
    }

    .inner {
        position: relative;
    }

    ul {
        display: flex;
    }

    li {
        margin-right: 2rem;
    }

    h1 {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        display: block;
        font-size: 1rem;
        font-weight: 400;
    }
</style>