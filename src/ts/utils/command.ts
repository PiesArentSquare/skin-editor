
export default interface i_command {
    do(): void
    undo(): void
}

export class command_group implements i_command {
    private stack: i_command[] = []

    add(c: i_command): void {
        c.do()
        this.stack.push(c)
    }

    do(): void {
        this.stack.forEach(c => {
            c.do()
        })
    }

    undo(): void {
        this.stack.slice().reverse().forEach(c => {
            c.undo()
        })
    }

    reset(): void {
        this.stack.length = 0
    }

    copy(): command_group {
        let copy = new command_group
        copy.stack = this.stack.slice()
        return copy
    }

    is_empty(): boolean {
        return this.stack.length === 0
    }

}

export class undo_redo_stack {
    private stack: i_command[] = []
    private live_size: number = 0

    do(c: i_command) {
        c.do()
        this.append(c)
    }

    append(c: i_command) {
        this.stack.length = this.live_size++
        this.stack.push(c)
    }

    undo() {
        if (this.live_size > 0) this.stack[--this.live_size].undo()
    }

    redo() {
        if (this.live_size < this.stack.length) this.stack[this.live_size++].do()
    }

    clear() {
        this.live_size = 0
        this.stack.length = 0
    }
}