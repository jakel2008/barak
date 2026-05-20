document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('catalog-search');
    const items = Array.from(document.querySelectorAll('.catalog-admin-item'));
    const statusNode = document.getElementById('catalog-reorder-status');

    const setStatus = function (message, isError) {
        if (!statusNode) {
            return;
        }
        statusNode.textContent = message;
        statusNode.dataset.state = isError ? 'error' : 'success';
    };

    if (searchInput && items.length) {
        searchInput.addEventListener('input', function () {
            const query = searchInput.value.trim().toLowerCase();
            items.forEach(function (item) {
                const haystack = (item.dataset.catalogSearch || '').toLowerCase();
                const visible = !query || haystack.includes(query);
                item.hidden = !visible;
                if (visible && query) {
                    item.open = true;
                }
            });
        });
    }

    const postJson = async function (url, payload) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json().catch(function () {
            return {};
        });
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'تعذر حفظ الترتيب الجديد.');
        }
    };

    let draggedDepartment = null;
    items.forEach(function (item) {
        item.addEventListener('dragstart', function () {
            draggedDepartment = item;
            item.classList.add('dragging');
        });
        item.addEventListener('dragend', function () {
            item.classList.remove('dragging');
            draggedDepartment = null;
        });
        item.addEventListener('dragover', function (event) {
            event.preventDefault();
        });
        item.addEventListener('drop', async function (event) {
            event.preventDefault();
            if (!draggedDepartment || draggedDepartment === item) {
                return;
            }
            const parent = item.parentElement;
            const bounds = item.getBoundingClientRect();
            const shouldInsertAfter = event.clientY > bounds.top + bounds.height / 2;
            parent.insertBefore(draggedDepartment, shouldInsertAfter ? item.nextSibling : item);
            const order = Array.from(parent.querySelectorAll('.catalog-admin-item')).map(function (node) {
                return node.dataset.departmentSlug;
            });
            Array.from(parent.querySelectorAll('.catalog-admin-item')).forEach(function (node, index) {
                const input = node.querySelector('input[name="sort_order"]');
                if (input) {
                    input.value = index + 1;
                }
            });
            try {
                await postJson('/admin/catalog/reorder/departments', { order: order });
                setStatus('تم حفظ ترتيب الأقسام.', false);
            } catch (error) {
                setStatus(error.message, true);
            }
        });
    });

    document.querySelectorAll('.subcategory-sort-list').forEach(function (listNode) {
        let draggedSubcategory = null;
        const items = Array.from(listNode.querySelectorAll('.subcategory-sort-item'));
        items.forEach(function (item) {
            item.addEventListener('dragstart', function () {
                draggedSubcategory = item;
                item.classList.add('dragging');
            });
            item.addEventListener('dragend', function () {
                item.classList.remove('dragging');
                draggedSubcategory = null;
            });
            item.addEventListener('dragover', function (event) {
                event.preventDefault();
            });
            item.addEventListener('drop', async function (event) {
                event.preventDefault();
                if (!draggedSubcategory || draggedSubcategory === item) {
                    return;
                }
                const bounds = item.getBoundingClientRect();
                const shouldInsertAfter = event.clientY > bounds.top + bounds.height / 2;
                listNode.insertBefore(draggedSubcategory, shouldInsertAfter ? item.nextSibling : item);
                const order = Array.from(listNode.querySelectorAll('.subcategory-sort-item')).map(function (node) {
                    return node.dataset.subcategorySlug;
                });
                Array.from(listNode.querySelectorAll('.subcategory-sort-item')).forEach(function (node, index) {
                    const input = node.querySelector('input[name="sort_order"]');
                    if (input) {
                        input.value = index + 1;
                    }
                });
                try {
                    await postJson('/admin/catalog/reorder/subcategories', {
                        department_slug: listNode.dataset.departmentSlug,
                        order: order
                    });
                    setStatus('تم حفظ ترتيب الأقسام الفرعية.', false);
                } catch (error) {
                    setStatus(error.message, true);
                }
            });
        });
    });
});
