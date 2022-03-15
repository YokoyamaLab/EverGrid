const option = {
    classPrefix: 'evergrid-',
    classSuffixGrid: 'grid',
    classSuffixCell: 'cell',
    defaultGridGap: '20px',
    widthPerHeight: 1,
};
let counter = 0;
const reposition = (target) => {
    const nCells = target.getElementsByClassName(option.classPrefix + option.classSuffixCell).length;
    const targetStyle = getComputedStyle(target);
    let gridPixels = {
        width: target.clientWidth,
        height: target.clientHeight
    };
    gridPixels.height -= parseFloat(targetStyle.paddingTop) + parseFloat(targetStyle.paddingBottom);
    gridPixels.width -= parseFloat(targetStyle.paddingLeft) + parseFloat(targetStyle.paddingRight);
    let gridSize = { h: 1, w: 1 };
    for (; gridSize.w * gridSize.h < nCells;) {
        if (expandW(gridSize, gridPixels.width, gridPixels.height)) {
            gridSize.w++;
        } else {
            gridSize.h++;
        }
    }
    target.style.setProperty('grid-template-columns', 'repeat(' + gridSize.w + ', 1fr)');
    target.style.setProperty('grid-template-rows', 'repeat(' + gridSize.h + ', 1fr)');
};
const expandW = (gridSize, width, height) => {
    const w = gridSize.w;
    const h = gridSize.h;
    const expandW = width / (w + 1) / (height / h);
    const expandH = width / w / (height / (h + 1));
    return Math.abs(option.widthPerHeight - expandW) < Math.abs(option.widthPerHeight - expandH);
};
const resizeObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
        reposition(entry.target);
    }
});

const addEverGridObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        let changeGrid = {};
        mutation.addedNodes.forEach((node) => {
            if (node.classList.contains(option.classPrefix + option.classSuffixCell)) {
                blessNewCell(node, node.parentNode.getAttribute("x-evergrid-id"))
                changeGrid[node.parentNode.getAttribute("x-evergrid-id")] = node.parentNode;
            }
        });
        mutation.removedNodes.forEach((node) => {
            if (node.classList.contains(option.classPrefix + option.classSuffixCell)) {
                const exparentGrid = document.querySelector("." + option.classPrefix + option.classSuffixGrid + "[x-evergrid-id='" + node.getAttribute("x-evergrid-belong-to") + "']");
                changeGrid[exparentGrid.getAttribute("x-evergrid-id")] = exparentGrid;
            }
        });
        for (let id in changeGrid) {
            reposition(changeGrid[id]);
        }
    });
});
const blessNewGrid = (grid) => {
    if (null == grid.getAttribute('x-evergrid-id')) {
        grid.style.setProperty('display', 'grid');
        let gridGap = '';
        gridGap = getComputedStyle(grid).getPropertyValue('grid-gap');
        gridGap = (gridGap == 'normal normal') ? getComputedStyle(document.querySelector('html')).getPropertyValue("--evergrid-gap-size") : gridGap;
        gridGap = (gridGap == '') ? option.defaultGridGap : gridGap;
        grid.style.setProperty('grid-gap', gridGap);
        const gridID = counter++;
        grid.setAttribute('x-evergrid-id', gridID);
        resizeObserver.observe(grid);
        return gridID;
    } else {
        return false;
    }
}
const blessNewCell = (cell, gridID) => {
    if (null == cell.getAttribute('x-evergrid-id')) {
        const cellID = counter++;
        cell.setAttribute('x-evergrid-id', cellID);
        cell.setAttribute('x-evergrid-belong-to', gridID);
        cell.style.setProperty('overflow', 'hidden');
        return cellID;
    } else {
        return false;
    }
}
export const everGrid = {
    init: (opt, watch = document.getElementsByTagName('body')[0]) => {
        for (let key in opt) {
            option[key] = opt[key];
        }
        for (const grid of watch.getElementsByClassName(option.classPrefix + option.classSuffixGrid)) {
            const gridID = blessNewGrid(grid);
            if (gridID !== false) {
                for (const cell of grid.getElementsByClassName(option.classPrefix + option.classSuffixCell)) {
                    blessNewCell(cell, gridID)
                }
            }
            reposition(grid);
            addEverGridObserver.observe(grid, { childList: true });
        }
    },
};
