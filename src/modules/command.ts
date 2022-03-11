
export interface command {
    do(): void
    undo(): void
}

export class commandGroup implements command {
    private stack: command[] = []

    add(c: command): void {
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

    copy(): commandGroup {
        let copy = new commandGroup
        copy.stack = this.stack.slice()
        return copy
    }

    is_empty(): boolean {
        return this.stack.length === 0
    }

}

export class undoRedoStack {
    private stack: command[] = []
    private live_size: number = 0

    do(c: command) {
        c.do()
        this.append(c)
    }

    append(c: command) {
        this.stack.length = this.live_size++
        this.stack.push(c)
    }

    undo() {
        if (this.live_size > 0) this.stack[--this.live_size].undo()
    }

    redo() {
        if (this.live_size < this.stack.length) this.stack[this.live_size++].do()
    }
}