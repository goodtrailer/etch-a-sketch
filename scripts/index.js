class Canvas
{
    #d_canvas;
    #d_inner;
    #d_cells = [];
    #lightnesses = [];

    #width;
    #height;

    #prevCell = undefined;
    #isRandomizingHue = false;

    constructor(d_canvas = null, width = 32, height = 32)
    {
        this.#d_canvas = d_canvas !== null
            ? d_canvas
            : document.createElement("div");

        this.#d_canvas.classList.add("canvas");
        this.#d_canvas.addEventListener("mouseenter", _ => this.#onCanvasHovered());

        this.#d_inner = document.createElement("div");
        this.#d_inner.style["display"] = "grid";
        this.#d_canvas.appendChild(this.#d_inner);

        this.setSize(width, height);
    }

    getRootNode()
    {
        return this.#d_canvas;
    }

    getSize()
    {
        return [this.#width, this.#height];
    }

    setSize(width, height)
    {
        this.#d_inner.textContent = "";
        this.#d_cells.length = 0;
        this.#lightnesses.length = 0;

        this.#d_inner.style["grid-template-columns"] = `repeat(${width}, 1fr)`;

        this.#d_inner.style["padding"] = width > height
            ? `calc((100% - (${height}% / ${width} * 100)) / 2) 0`
            : `0 calc((100% - (${width}% / ${height} * 100)) / 2)`;

        for (let i = 0; i < width * height; i++)
        {
            const cell = document.createElement("div");
            cell.classList.add("cell");

            cell.addEventListener("mouseenter", _ => this.#onCellHovered(i));

            this.#d_inner.appendChild(cell);
            this.#d_cells.push(cell);
            this.#lightnesses.push(1);
        }

        this.#width = width;
        this.#height = height;
    }

    getIsRandomizingHue(value)
    {
        return this.#isRandomizingHue;
    }

    setIsRandomizingHue(value)
    {
        this.#isRandomizingHue = value;
    }

    #onCanvasHovered()
    {
        this.#prevCell = undefined;
    }

    #onCellHovered(index)
    {
        console.log(`${this.#prevCell} -> ${index}`);

        if (this.#prevCell === undefined)
        {
            this.#colorCell(index);
            this.#prevCell = index;
            return;
        }

        const x0 = this.#prevCell % this.#width;
        const y0 = Math.floor(this.#prevCell / this.#width);
        const x1 = index % this.#width;
        const y1 = Math.floor(index / this.#width);

        // Bresenham's line algorithm: code copied from
        // https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm#All_cases

        const dx = Math.abs(x1 - x0);
        const sx = x0 < x1 ? 1 : -1;
        const dy = -Math.abs(y1 - y0);
        const sy = y0 < y1 ? 1 : -1;

        let error = dx + dy;
        let x = x0;
        let y = y0;
        while (true)
        {
            if (x === x1 && y === y1)
                break;

            if (x !== x0 || y !== y0)
                this.#colorCell(y * this.#width + x);

            if (2 * error >= dy)
            {
                if (x === x1)
                    break;

                error += dy;
                x += sx;
            }

            if (2 * error <= dx)
            {
                if (y === y1)
                    break;

                error += dx;
                y += sy;
            }
        }
        this.#colorCell(y1 * this.#width + x1);

        this.#prevCell = index;
    }

    #colorCell(index)
    {
        const lightness = Math.max(0, this.#lightnesses[index] - 0.1);
        this.#lightnesses[index] = lightness;

        const hue = this.#isRandomizingHue
            ? Math.floor(Math.random() * 360)
            : 0;

        const saturation = this.#isRandomizingHue
            ? Math.floor(Math.random() * 101)
            : 0;

        this.#d_cells[index].style["background-color"] = `hsl(${hue}, ${saturation}%, ${lightness * 100}%)`;
    }
}

function main()
{
    const min_size = 1;
    const max_size = 99;

    const canvas = new Canvas(document.querySelector(".canvas"));

    const sizeInput = document.querySelector(".size-container input");
    const sizeButton = document.querySelector(".size-container button");

    sizeInput.value = canvas.getSize()[0];
    sizeInput.setAttribute("min", min_size);
    sizeInput.setAttribute("max", max_size);

    sizeInput.addEventListener("focusout", _ =>
    {
        const clamp = Math.max(min_size, Math.min(sizeInput.value, max_size));
        sizeInput.value = clamp;
    });

    sizeButton.addEventListener("click", _ =>
    {
        const size = sizeInput.value;
        canvas.setSize(size, size);
    });

    const rainbowCheckbox = document.querySelector(".rainbow-container input");
    rainbowCheckbox.checked = false;
    rainbowCheckbox.addEventListener("input", _ => canvas.setIsRandomizingHue(rainbowCheckbox.checked));
}

window.onload = main;
