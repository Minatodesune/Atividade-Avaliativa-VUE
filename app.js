const { createApp, ref, computed, onMounted } = Vue;

createApp({
    setup() {
        // Estado da aplicação
        const equipments = ref([]);
        const currentEquipment = ref({
            id: null,
            name: '',
            category: '',
            patrimony: '',
            status: 'disponível'
        });
        const isEditing = ref(false);
        const filterCategory = ref('');
        const filterStatus = ref('');

        // Carregar dados do localStorage ao iniciar
        onMounted(() => {
            const savedEquipments = localStorage.getItem('eggmanEquipments');
            if (savedEquipments) {
                equipments.value = JSON.parse(savedEquipments);
            }
        });

        // Salvar dados no localStorage sempre que a lista mudar
        const saveToLocalStorage = () => {
            localStorage.setItem('eggmanEquipments', JSON.stringify(equipments.value));
        };

        // Computed properties
        const totalEquipments = computed(() => equipments.value.length);
        
        const availableCount = computed(() => 
            equipments.value.filter(e => e.status === 'disponível').length
        );
        
        const borrowedCount = computed(() => 
            equipments.value.filter(e => e.status === 'emprestado').length
        );
        
        const isFormValid = computed(() => 
            currentEquipment.value.name.trim() !== '' && 
            currentEquipment.value.category !== '' && 
            currentEquipment.value.patrimony.trim() !== ''
        );
        
        const filteredEquipments = computed(() => {
            return equipments.value.filter(equipment => {
                const matchesCategory = filterCategory.value === '' || equipment.category === filterCategory.value;
                const matchesStatus = filterStatus.value === '' || equipment.status === filterStatus.value;
                return matchesCategory && matchesStatus;
            });
        });

        // Métodos
        const generateId = () => {
            return Date.now().toString(36) + Math.random().toString(36).substring(2);
        };

        const saveEquipment = () => {
            if (!isFormValid.value) return;
            
            if (isEditing.value) {
                // Atualizar equipamento existente
                const index = equipments.value.findIndex(e => e.id === currentEquipment.value.id);
                if (index !== -1) {
                    equipments.value[index] = { ...currentEquipment.value };
                }
            } else {
                // Adicionar novo equipamento
                equipments.value.push({
                    ...currentEquipment.value,
                    id: generateId()
                });
            }
            
            resetForm();
            saveToLocalStorage();
        };

        const editEquipment = (equipment) => {
            currentEquipment.value = { ...equipment };
            isEditing.value = true;
            // Focar no primeiro campo do formulário para acessibilidade
            setTimeout(() => document.getElementById('name').focus(), 100);
        };

        const cancelEdit = () => {
            resetForm();
        };

        const deleteEquipment = (id) => {
            if (window.confirm('Tem certeza que deseja remover este equipamento?')) {
                const index = equipments.value.findIndex(e => e.id === id);
                if (index !== -1) {
                    equipments.value.splice(index, 1);
                    saveToLocalStorage();
                }
            }
        };

        const resetForm = () => {
            currentEquipment.value = {
                id: null,
                name: '',
                category: '',
                patrimony: '',
                status: 'disponível'
            };
            isEditing.value = false;
        };

        // Expor para o template
        return {
            equipments,
            currentEquipment,
            isEditing,
            filterCategory,
            filterStatus,
            totalEquipments,
            availableCount,
            borrowedCount,
            isFormValid,
            filteredEquipments,
            saveEquipment,
            editEquipment,
            cancelEdit,
            deleteEquipment
        };
    }
}).mount('#app');