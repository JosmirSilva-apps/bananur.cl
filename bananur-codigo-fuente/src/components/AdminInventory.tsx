import React, { useState, useEffect } from 'react';
import { Product, Service, PortfolioItem, ClothingLot } from '../types';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  Copy, 
  EyeOff, 
  Check, 
  X, 
  ShieldAlert, 
  Upload, 
  Image, 
  Sparkles, 
  Globe, 
  Layers, 
  BookOpen, 
  Shirt, 
  Scale, 
  Calculator, 
  Tag, 
  Boxes, 
  Package, 
  FolderPlus, 
  ArrowRight, 
  LayoutGrid, 
  List, 
  ChevronLeft, 
  ChevronRight,
  Scan,
  Barcode,
  RefreshCw
} from 'lucide-react';
import BarcodeBadge from './BarcodeBadge';
import { generateUniqueCode } from '../services/barcodeService';

interface AdminInventoryProps {
  products: Product[];
  services: Service[];
  portfolioItems: PortfolioItem[];
  productCategories?: string[];
  serviceCategories?: string[];
  portfolioCategories?: string[];
  clothingLots?: ClothingLot[];
  onUpdateClothingLots?: (lots: ClothingLot[]) => void;
  onAddProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  onToggleProductActive: (id: string) => void;
  onDuplicateProduct: (id: string) => void;
  onAddService?: (s: Service) => void;
  onAddPortfolioItem?: (p: PortfolioItem) => void;
  onDeleteService?: (id: string) => void;
  onDeletePortfolioItem?: (id: string) => void;
  onEditProduct?: (p: Product) => void;
  onEditService?: (s: Service) => void;
  onEditPortfolioItem?: (p: PortfolioItem) => void;
  onOpenScanner?: () => void;
}

const DEFAULT_CLOTHING_LOTS: ClothingLot[] = [
  {
    id: 'lot-1',
    code: 'FRD-DNM-90S',
    name: 'Fardo Chaquetas & Denim 90s USA',
    pricePerKg: 28000,
    origin: 'Importación Directa USA - Grado A',
    totalWeightKg: 45,
    itemsCount: 60,
    dateAdded: '2026-06-10',
    notes: 'Selección de denim pesado, chaquetas Levi\'s y Wrangler vintage.'
  },
  {
    id: 'lot-2',
    code: 'FRD-KNIT-CL',
    name: 'Fardo Sweaters & Lana Retro Chilena',
    pricePerKg: 18500,
    origin: 'Curaduría Nacional - Sur de Chile',
    totalWeightKg: 30,
    itemsCount: 45,
    dateAdded: '2026-06-15',
    notes: 'Tejidos gruesos de lana natural y acrílico vintage.'
  },
  {
    id: 'lot-3',
    code: 'FRD-CAS-MIX',
    name: 'Fardo Camisas & Polerones Vintage Mix',
    pricePerKg: 14900,
    origin: 'Selección Europea Italia / Alemania',
    totalWeightKg: 50,
    itemsCount: 95,
    dateAdded: '2026-06-18',
    notes: 'Camisas leñadoras franela y polerones oversize 80s/90s.'
  }
];

export default function AdminInventory({
  products,
  services,
  portfolioItems = [],
  productCategories = ['Papelería', 'Accesorios', 'Arte & Decoración', 'Ropa'],
  serviceCategories = ['Diseño', 'Digital', 'Consultoría', 'Packaging'],
  portfolioCategories = ['Diseño & E-commerce', 'Branding', 'Branding & Packaging', 'Desarrollo Web'],
  clothingLots,
  onUpdateClothingLots,
  onAddProduct,
  onDeleteProduct,
  onToggleProductActive,
  onDuplicateProduct,
  onAddService,
  onAddPortfolioItem,
  onDeleteService,
  onDeletePortfolioItem,
  onEditProduct,
  onEditService,
  onEditPortfolioItem,
  onOpenScanner
}: AdminInventoryProps) {
  const [activeTab, setActiveTab] = useState<'fisicos' | 'servicios' | 'portafolio'>('fisicos');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');

  // Clothing Lots State
  const [availableLots, setAvailableLots] = useState<ClothingLot[]>(clothingLots && clothingLots.length > 0 ? clothingLots : DEFAULT_CLOTHING_LOTS);

  useEffect(() => {
    if (clothingLots && clothingLots.length > 0) {
      setAvailableLots(clothingLots);
    }
  }, [clothingLots]);
  
  // Custom states for modal actions
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  // Editing state variables
  const [editingItemType, setEditingItemType] = useState<'producto' | 'servicio' | 'portafolio' | null>(null);

  // Edited Product states:
  const [editProdId, setEditProdId] = useState('');
  const [editProdCode, setEditProdCode] = useState('');
  const [editProdName, setEditProdName] = useState('');
  const [editProdPrice, setEditProdPrice] = useState('');
  const [editProdStock, setEditProdStock] = useState('');
  const [editProdCategory, setEditProdCategory] = useState('');
  const [editProdDesc, setEditProdDesc] = useState('');
  const [editProdImage, setEditProdImage] = useState('');
  const [editClothingType, setEditClothingType] = useState<'nueva' | 'vintage'>('nueva');
  const [editProdWeightGrams, setEditProdWeightGrams] = useState('400');
  const [editProdPricePerKg, setEditProdPricePerKg] = useState('24000');
  const [editProdLotId, setEditProdLotId] = useState<string>('lot-1');
  const [editProdLotCode, setEditProdLotCode] = useState<string>('FRD-DNM-90S');
  const [editProdLotName, setEditProdLotName] = useState<string>('Fardo Chaquetas & Denim 90s USA');
  const [editShowNewLotForm, setEditShowNewLotForm] = useState(false);

  // Edited Service states:
  const [editServId, setEditServId] = useState('');
  const [editServCode, setEditServCode] = useState('');
  const [editServName, setEditServName] = useState('');
  const [editServCategory, setEditServCategory] = useState('');
  const [editServPrice, setEditServPrice] = useState('');
  const [editServDesc, setEditServDesc] = useState('');
  const [editServIcon, setEditServIcon] = useState('');
  const [editServDetails, setEditServDetails] = useState('');

  // Edited Portfolio states:
  const [editPortId, setEditPortId] = useState('');
  const [editPortName, setEditPortName] = useState('');
  const [editPortClient, setEditPortClient] = useState('');
  const [editPortCategory, setEditPortCategory] = useState('');
  const [editPortDesc, setEditPortDesc] = useState('');
  const [editPortImage, setEditPortImage] = useState('');
  const [editPortProblem, setEditPortProblem] = useState('');
  const [editPortSolution, setEditPortSolution] = useState('');
  const [editPortResult, setEditPortResult] = useState('');
  const [editPortStack, setEditPortStack] = useState('');

  // To allow switching between adding a product, service or portfolio item:
  const [createdItemType, setCreatedItemType] = useState<'producto' | 'servicio' | 'portafolio'>('producto');

  // New product input state
  const [newProdName, setNewProdName] = useState('');
  const [newProdCode, setNewProdCode] = useState(() => generateUniqueCode('product', productCategories[0]));
  const [newProdPrice, setNewProdPrice] = useState('19990');
  const [newProdStock, setNewProdStock] = useState('10');
  const [newProdCategory, setNewProdCategory] = useState(productCategories[0] || 'Papelería');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800');
  
  // New Clothing sub-category, lot, and weight states
  const [newClothingType, setNewClothingType] = useState<'nueva' | 'vintage'>('nueva');
  const [newProdWeightGrams, setNewProdWeightGrams] = useState('350');
  const [newProdPricePerKg, setNewProdPricePerKg] = useState('28000');
  const [newProdLotId, setNewProdLotId] = useState<string>('lot-1');
  const [newProdLotCode, setNewProdLotCode] = useState<string>('FRD-DNM-90S');
  const [newProdLotName, setNewProdLotName] = useState<string>('Fardo Chaquetas & Denim 90s USA');
  const [showNewLotForm, setShowNewLotForm] = useState(false);

  // New Lot quick registration form
  const [createLotCode, setCreateLotCode] = useState('');
  const [createLotName, setCreateLotName] = useState('');
  const [createLotTotalPrice, setCreateLotTotalPrice] = useState('1260000');
  const [createLotWeightKg, setCreateLotWeightKg] = useState('45');
  const [createLotPricePerKg, setCreateLotPricePerKg] = useState('28000');
  const [createLotOrigin, setCreateLotOrigin] = useState('');

  // Automatically recalculate price per kg from total bale price and total bale weight
  useEffect(() => {
    const price = Number(createLotTotalPrice) || 0;
    const weight = Number(createLotWeightKg) || 0;
    if (price > 0 && weight > 0) {
      const calculatedRate = Math.round(price / weight);
      setCreateLotPricePerKg(String(calculatedRate));
    }
  }, [createLotTotalPrice, createLotWeightKg]);

  // Function to register a new clothing lot / fardo
  const handleAddNewLot = (isEditing: boolean = false) => {
    if (!createLotCode.trim() || !createLotName.trim()) return;
    const priceNum = Number(createLotTotalPrice) || 0;
    const weightNum = Number(createLotWeightKg) || 0;
    const calcRate = (priceNum > 0 && weightNum > 0) ? Math.round(priceNum / weightNum) : (Number(createLotPricePerKg) || 0);
    const finalRate = Number(createLotPricePerKg) > 0 ? Number(createLotPricePerKg) : calcRate;

    const newLot: ClothingLot = {
      id: `lot-${Date.now()}`,
      code: createLotCode.trim().toUpperCase(),
      name: createLotName.trim(),
      pricePerKg: finalRate,
      totalPrice: priceNum > 0 ? priceNum : undefined,
      totalWeightKg: weightNum > 0 ? weightNum : undefined,
      origin: createLotOrigin.trim() || 'Curaduría Especial',
      dateAdded: new Date().toISOString().split('T')[0]
    };

    const updatedLots = [newLot, ...availableLots];
    setAvailableLots(updatedLots);
    if (onUpdateClothingLots) {
      onUpdateClothingLots(updatedLots);
    }

    if (isEditing) {
      setEditProdLotId(newLot.id);
      setEditProdLotCode(newLot.code);
      setEditProdLotName(newLot.name);
      setEditProdPricePerKg(String(newLot.pricePerKg));
      const w = Number(editProdWeightGrams) || 0;
      setEditProdPrice(String(Math.round((w / 1000) * newLot.pricePerKg)));
      setEditShowNewLotForm(false);
    } else {
      setNewProdLotId(newLot.id);
      setNewProdLotCode(newLot.code);
      setNewProdLotName(newLot.name);
      setNewProdPricePerKg(String(newLot.pricePerKg));
      const w = Number(newProdWeightGrams) || 0;
      setNewProdPrice(String(Math.round((w / 1000) * newLot.pricePerKg)));
      setShowNewLotForm(false);
    }

    // Reset form fields
    setCreateLotCode('');
    setCreateLotName('');
    setCreateLotTotalPrice('1260000');
    setCreateLotWeightKg('45');
    setCreateLotPricePerKg('28000');
    setCreateLotOrigin('');
  };

  // Function to handle lot selection from dropdown
  const handleSelectLot = (lotId: string, isEditing: boolean = false) => {
    if (lotId === 'custom') {
      if (isEditing) {
        setEditProdLotId('custom');
        setEditProdLotCode('LOTE-PERSONALIZADO');
        setEditProdLotName('Lote Textil Especial');
      } else {
        setNewProdLotId('custom');
        setNewProdLotCode('LOTE-PERSONALIZADO');
        setNewProdLotName('Lote Textil Especial');
      }
      return;
    }

    const selected = availableLots.find(l => l.id === lotId);
    if (selected) {
      if (isEditing) {
        setEditProdLotId(selected.id);
        setEditProdLotCode(selected.code);
        setEditProdLotName(selected.name);
        setEditProdPricePerKg(String(selected.pricePerKg));
        const w = Number(editProdWeightGrams) || 0;
        setEditProdPrice(String(Math.round((w / 1000) * selected.pricePerKg)));
      } else {
        setNewProdLotId(selected.id);
        setNewProdLotCode(selected.code);
        setNewProdLotName(selected.name);
        setNewProdPricePerKg(String(selected.pricePerKg));
        const w = Number(newProdWeightGrams) || 0;
        setNewProdPrice(String(Math.round((w / 1000) * selected.pricePerKg)));
      }
    }
  };

  // New Service inputs
  const [newServName, setNewServName] = useState('');
  const [newServCode, setNewServCode] = useState(() => generateUniqueCode('service', serviceCategories[0]));
  const [newServCategory, setNewServCategory] = useState(serviceCategories[0] || 'Diseño');
  const [newServPrice, setNewServPrice] = useState('450000');
  const [newServDesc, setNewServDesc] = useState('');
  const [newServIcon, setNewServIcon] = useState('Sparkles');
  const [newServDetailsForm, setNewServDetailsForm] = useState('Propuesta inicial conceptual, Revisiones de diseño, Archivos vectoriales finales (.AI, .PDF)');

  // New Portfolio Item inputs
  const [newPortName, setNewPortName] = useState('');
  const [newPortClient, setNewPortClient] = useState('');
  const [newPortCategory, setNewPortCategory] = useState(portfolioCategories[0] || 'Diseño & E-commerce');
  const [newPortDesc, setNewPortDesc] = useState('');
  const [newPortImage, setNewPortImage] = useState('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800');
  const [newPortProblem, setNewPortProblem] = useState('');
  const [newPortSolution, setNewPortSolution] = useState('');
  const [newPortResult, setNewPortResult] = useState('');
  const [newPortStack, setNewPortStack] = useState('Figma, Tailwind CSS, React');

  // View mode & Pagination states
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);

  // Tab switching handler with filter resets
  const handleTabChange = (tab: 'fisicos' | 'servicios' | 'portafolio') => {
    setActiveTab(tab);
    setSearchQuery('');
    setCategoryFilter('Todas');
    setCurrentPage(1);
  };

  // Filter products by name, category, or unique code/SKU
  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = 
      !q ||
      p.name.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q) ||
      (p.code && p.code.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      p.id.toLowerCase().includes(q);
    const matchesCat = categoryFilter === 'Todas' || p.category === categoryFilter;
    return matchesQuery && matchesCat;
  });

  // Filter services by name, description, category, or unique service code
  const filteredServices = services.filter(s => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = 
      !q ||
      s.name.toLowerCase().includes(q) || 
      s.description.toLowerCase().includes(q) ||
      (s.code && s.code.toLowerCase().includes(q)) ||
      s.id.toLowerCase().includes(q);
    const matchesCat = categoryFilter === 'Todas' || s.category === categoryFilter;
    return matchesQuery && matchesCat;
  });

  const filteredPortfolio = portfolioItems.filter(p => {
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.client.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.stack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = categoryFilter === 'Todas' || p.category === categoryFilter;
    return matchesQuery && matchesCat;
  });

  // Active items count based on tab
  const activeItemsCount = activeTab === 'fisicos' ? filteredProducts.length :
                           activeTab === 'servicios' ? filteredServices.length : filteredPortfolio.length;

  const totalPages = Math.max(1, Math.ceil(activeItemsCount / itemsPerPage));
  const effectivePage = Math.min(currentPage, totalPages);

  const paginatedProducts = filteredProducts.slice((effectivePage - 1) * itemsPerPage, effectivePage * itemsPerPage);
  const paginatedServices = filteredServices.slice((effectivePage - 1) * itemsPerPage, effectivePage * itemsPerPage);
  const paginatedPortfolio = filteredPortfolio.slice((effectivePage - 1) * itemsPerPage, effectivePage * itemsPerPage);

  // Automatically recalculate price when weight or price per kg changes for vintage clothes in creation
  useEffect(() => {
    if (newProdCategory.toLowerCase() === 'ropa' && newClothingType === 'vintage') {
      const weight = Number(newProdWeightGrams) || 0;
      const rate = Number(newProdPricePerKg) || 0;
      const calculated = Math.round((weight / 1000) * rate);
      if (calculated > 0) {
        setNewProdPrice(String(calculated));
      }
    }
  }, [newProdCategory, newClothingType, newProdWeightGrams, newProdPricePerKg]);

  // Automatically recalculate price when weight or price per kg changes for vintage clothes in edition
  useEffect(() => {
    if (editProdCategory.toLowerCase() === 'ropa' && editClothingType === 'vintage') {
      const weight = Number(editProdWeightGrams) || 0;
      const rate = Number(editProdPricePerKg) || 0;
      const calculated = Math.round((weight / 1000) * rate);
      if (calculated > 0) {
        setEditProdPrice(String(calculated));
      }
    }
  }, [editProdCategory, editClothingType, editProdWeightGrams, editProdPricePerKg]);

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();

    if (createdItemType === 'producto') {
      if (!newProdName.trim()) return;

      const isRopa = newProdCategory.toLowerCase() === 'ropa';
      const weightNum = Number(newProdWeightGrams) || 0;
      const rateNum = Number(newProdPricePerKg) || 0;
      const calcPrice = isRopa && newClothingType === 'vintage' ? Math.round((weightNum / 1000) * rateNum) : Number(newProdPrice) || 0;
      const finalPrice = Number(newProdPrice) > 0 ? Number(newProdPrice) : calcPrice;

      const selectedLot = isRopa && newClothingType === 'vintage' ? availableLots.find(l => l.id === newProdLotId) : null;
      const lotCodeToSave = isRopa && newClothingType === 'vintage' ? (newProdLotCode || selectedLot?.code) : undefined;
      const lotNameToSave = isRopa && newClothingType === 'vintage' ? (newProdLotName || selectedLot?.name) : undefined;
      const lotIdToSave = isRopa && newClothingType === 'vintage' ? (newProdLotId || selectedLot?.id) : undefined;

      const productDetails = isRopa
        ? newClothingType === 'vintage'
          ? [
              'Clasificación: Ropa Vintage por Peso',
              lotCodeToSave ? `Lote / Fardo de Origen: [${lotCodeToSave}] ${lotNameToSave || ''}` : '',
              `Peso neto de la prenda: ${weightNum} gramos (${(weightNum / 1000).toFixed(2)} kg)`,
              `Tarifa de tasación fardo: $${rateNum.toLocaleString('es-CL')} / kg`,
              'Pieza única curada y sanitizada con ozono ecológico'
            ].filter(Boolean)
          : [
              'Clasificación: Ropa Nueva de Colección',
              'Confección textil de alta calidad',
              'Diseñado y producido por Bananur'
            ]
        : ['Manufactura local sostenible', 'Diseñado por Bananur.'];

      const finalProdCode = (newProdCode && newProdCode.trim().toUpperCase()) || generateUniqueCode('product', newProdCategory);
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        code: finalProdCode,
        sku: finalProdCode,
        barcode: finalProdCode,
        name: newProdName,
        price: finalPrice,
        stock: Number(newProdStock) || 0,
        description: newProdDesc || (isRopa ? (newClothingType === 'vintage' ? `Prenda vintage recuperada del fardo ${lotCodeToSave || ''}. Curaduría de autor.` : 'Prenda textil nueva de autor.') : 'Descripción del nuevo objeto boutique.'),
        category: newProdCategory,
        images: [newProdImage],
        variants: isRopa ? ['Talla Única', 'Talla S', 'Talla M', 'Talla L'] : ['Estándar'],
        lowStockThreshold: 3,
        details: productDetails,
        clothingType: isRopa ? newClothingType : undefined,
        weightGrams: isRopa && newClothingType === 'vintage' ? weightNum : undefined,
        pricePerKg: isRopa && newClothingType === 'vintage' ? rateNum : undefined,
        lotId: lotIdToSave,
        lotCode: lotCodeToSave,
        lotName: lotNameToSave
      };
      onAddProduct(newProd);
      setNewProdName('');
      setNewProdCode(generateUniqueCode('product', newProdCategory));
      setNewProdPrice('19990');
      setNewProdStock('10');
      setNewProdDesc('');
      setNewProdWeightGrams('350');
      setNewProdPricePerKg('28000');
    } else if (createdItemType === 'servicio') {
      if (!newServName.trim()) return;
      const finalServCode = (newServCode && newServCode.trim().toUpperCase()) || generateUniqueCode('service', newServCategory);
      const newServ: Service = {
        id: `serv-${Date.now()}`,
        code: finalServCode,
        name: newServName,
        category: newServCategory,
        price: Number(newServPrice) || 0,
        description: newServDesc || 'Descripción técnica del servicio de diseño boutique.',
        iconName: newServIcon,
        details: newServDetailsForm.split(',').map(s => s.trim()).filter(Boolean)
      };
      if (onAddService) {
        onAddService(newServ);
      }
      setNewServName('');
      setNewServCode(generateUniqueCode('service', newServCategory));
      setNewServPrice('450000');
      setNewServDesc('');
    } else if (createdItemType === 'portafolio') {
      if (!newPortName.trim()) return;
      const newPort: PortfolioItem = {
        id: `port-${Date.now()}`,
        name: newPortName,
        client: newPortClient || 'Cliente Particular',
        category: newPortCategory,
        description: newPortDesc || 'Detalles del caso de estudio.',
        image: newPortImage,
        problem: newPortProblem || 'Desafío detectado por nuestro equipo.',
        solution: newPortSolution || 'Nuestra respuesta técnica y artística.',
        stack: newPortStack.split(',').map(s => s.trim()).filter(Boolean),
        result: newPortResult || 'Resultados de conversión logrados.',
        mockType: 'notebook'
      };
      if (onAddPortfolioItem) {
        onAddPortfolioItem(newPort);
      }
      setNewPortName('');
      setNewPortClient('');
      setNewPortDesc('');
      setNewPortProblem('');
      setNewPortSolution('');
      setNewPortResult('');
    }

    setShowAddModal(false);
  };

  const handleStartEditProduct = (p: Product) => {
    setEditProdId(p.id);
    setEditProdCode(p.code || p.sku || p.id);
    setEditProdName(p.name);
    setEditProdPrice(String(p.price));
    setEditProdStock(String(p.stock));
    setEditProdCategory(p.category);
    setEditProdDesc(p.description);
    setEditProdImage(p.images[0] || '');
    setEditClothingType(p.clothingType || 'nueva');
    setEditProdWeightGrams(p.weightGrams ? String(p.weightGrams) : '350');
    setEditProdPricePerKg(p.pricePerKg ? String(p.pricePerKg) : '24000');
    setEditProdLotId(p.lotId || (availableLots[0]?.id || 'custom'));
    setEditProdLotCode(p.lotCode || (availableLots[0]?.code || ''));
    setEditProdLotName(p.lotName || (availableLots[0]?.name || ''));
    setEditShowNewLotForm(false);
    setEditingItemType('producto');
  };

  const handleStartEditService = (s: Service) => {
    setEditServId(s.id);
    setEditServCode(s.code || s.id);
    setEditServName(s.name);
    setEditServCategory(s.category);
    setEditServPrice(String(s.price));
    setEditServDesc(s.description);
    setEditServIcon(s.iconName);
    setEditServDetails(s.details.join(', '));
    setEditingItemType('servicio');
  };

  const handleStartEditPortfolio = (p: PortfolioItem) => {
    setEditPortId(p.id);
    setEditPortName(p.name);
    setEditPortClient(p.client);
    setEditPortCategory(p.category);
    setEditPortDesc(p.description);
    setEditPortImage(p.image);
    setEditPortProblem(p.problem || '');
    setEditPortSolution(p.solution || '');
    setEditPortResult(p.result || '');
    setEditPortStack(p.stack.join(', '));
    setEditingItemType('portafolio');
  };

  const handleSaveEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItemType === 'producto') {
      if (onEditProduct) {
        const isRopa = editProdCategory.toLowerCase() === 'ropa';
        const weightNum = Number(editProdWeightGrams) || 0;
        const rateNum = Number(editProdPricePerKg) || 0;

        const selectedLot = isRopa && editClothingType === 'vintage' ? availableLots.find(l => l.id === editProdLotId) : null;
        const lotCodeToSave = isRopa && editClothingType === 'vintage' ? (editProdLotCode || selectedLot?.code) : undefined;
        const lotNameToSave = isRopa && editClothingType === 'vintage' ? (editProdLotName || selectedLot?.name) : undefined;
        const lotIdToSave = isRopa && editClothingType === 'vintage' ? (editProdLotId || selectedLot?.id) : undefined;

        const productDetails = isRopa
          ? editClothingType === 'vintage'
            ? [
                'Clasificación: Ropa Vintage por Peso',
                lotCodeToSave ? `Lote / Fardo de Origen: [${lotCodeToSave}] ${lotNameToSave || ''}` : '',
                `Peso neto de la prenda: ${weightNum} gramos (${(weightNum / 1000).toFixed(2)} kg)`,
                `Tarifa de tasación fardo: $${rateNum.toLocaleString('es-CL')} / kg`,
                'Pieza única curada y sanitizada con ozono ecológico'
              ].filter(Boolean)
            : [
                'Clasificación: Ropa Nueva de Colección',
                'Confección textil de alta calidad',
                'Diseñado y producido por Bananur'
              ]
          : ['Manufactura local sostenible', 'Diseñado por Bananur.'];

        onEditProduct({
          id: editProdId,
          code: editProdCode || editProdId,
          sku: editProdCode || editProdId,
          barcode: editProdCode || editProdId,
          name: editProdName,
          price: Number(editProdPrice) || 0,
          stock: Number(editProdStock) || 0,
          category: editProdCategory,
          description: editProdDesc,
          images: [editProdImage],
          variants: isRopa ? ['Talla Única', 'Talla S', 'Talla M', 'Talla L'] : ['Estándar'],
          lowStockThreshold: 3,
          details: productDetails,
          clothingType: isRopa ? editClothingType : undefined,
          weightGrams: isRopa && editClothingType === 'vintage' ? weightNum : undefined,
          pricePerKg: isRopa && editClothingType === 'vintage' ? rateNum : undefined,
          lotId: lotIdToSave,
          lotCode: lotCodeToSave,
          lotName: lotNameToSave
        });
      }
    } else if (editingItemType === 'servicio') {
      if (onEditService) {
        onEditService({
          id: editServId,
          code: editServCode || editServId,
          name: editServName,
          category: editServCategory,
          price: Number(editServPrice) || 0,
          description: editServDesc,
          iconName: editServIcon,
          details: editServDetails.split(',').map(s => s.trim()).filter(Boolean)
        });
      }
    } else if (editingItemType === 'portafolio') {
      if (onEditPortfolioItem) {
        onEditPortfolioItem({
          id: editPortId,
          name: editPortName,
          client: editPortClient,
          category: editPortCategory,
          description: editPortDesc,
          image: editPortImage,
          problem: editPortProblem,
          solution: editPortSolution,
          stack: editPortStack.split(',').map(s => s.trim()).filter(Boolean),
          result: editPortResult,
          mockType: 'notebook'
        });
      }
    }
    setEditingItemType(null);
  };

  const triggerDuplicate = (id: string) => {
    onDuplicateProduct(id);
  };

  const renderServiceIcon = (iconName: string) => {
    if (iconName === 'Globe') return <Globe className="w-5 h-5 text-bananur-gold-dark" />;
    if (iconName === 'Layers') return <Layers className="w-5 h-5 text-bananur-gold-dark" />;
    if (iconName === 'BookOpen') return <BookOpen className="w-5 h-5 text-bananur-gold-dark" />;
    return <Sparkles className="w-5 h-5 text-bananur-gold-dark" />;
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 animate-fade-in bg-bananur-cream min-h-screen">
      
      {/* Title & Actions layout */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#B58455] font-bold">Catálogo Creativo</span>
          <h1 className="text-3xl font-serif font-extrabold text-bananur-clay">Catálogo Web Webmaster</h1>
          <p className="text-xs text-bananur-clay-light font-light">Agrega, edita y administra tus objetos de papelería física, servicios técnicos de marca y portafolio de proyectos.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenScanner && (
            <button
              id="btn-trigger-scanner"
              type="button"
              onClick={onOpenScanner}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-bananur-clay font-bold px-4 py-3 rounded-xl text-xs transition-all shadow-sm cursor-pointer border border-amber-600/30"
              title="Abrir Lector de Código de Barras (Ctrl+B)"
            >
              <Scan className="w-4 h-4" />
              <span>Lector de Códigos (POS / Inventario)</span>
            </button>
          )}
          <button
            id="btn-trigger-new-product"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-bananur-clay text-bananur-cream px-5 py-3 rounded-xl text-xs font-semibold hover:bg-bananur-gold hover:text-bananur-clay transition-all shadow-sm cursor-pointer shadow-inner"
          >
            <Plus className="w-4 h-4" />
            Nuevo Elemento
          </button>
        </div>
      </div>

      {/* Tabs list switch */}
      <div className="flex border-b border-bananur-sand/80">
        <button
          id="tab-btn-fisicos"
          onClick={() => handleTabChange('fisicos')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'fisicos' 
              ? 'border-bananur-gold text-bananur-clay font-bold' 
              : 'border-transparent text-bananur-clay-light hover:text-bananur-gold'
          }`}
        >
          Productos Físicos
        </button>
        <button
          id="tab-btn-servicios"
          onClick={() => handleTabChange('servicios')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'servicios' 
              ? 'border-bananur-gold text-bananur-clay font-bold' 
              : 'border-transparent text-bananur-clay-light hover:text-bananur-gold'
          }`}
        >
          Servicios
        </button>
        <button
          id="tab-btn-portafolio"
          onClick={() => handleTabChange('portafolio')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'portafolio' 
              ? 'border-bananur-gold text-bananur-clay font-bold' 
              : 'border-transparent text-bananur-clay-light hover:text-bananur-gold'
          }`}
        >
          Portafolio Digital
        </button>
      </div>

      {/* SEARCH AND FILTERS DOCK */}
      <div className="bg-white p-4 rounded-xl border border-bananur-sand flex flex-col md:flex-row gap-4 items-center shadow-xs">
        <div className="relative flex-1 w-full">
          <input
            id="inv-search"
            type="text"
            placeholder={
              activeTab === 'fisicos' 
                ? 'Buscar producto por nombre o categoría...' 
                : activeTab === 'servicios' 
                ? 'Buscar servicio o categoría técnica...' 
                : 'Buscar proyecto por marca, cliente o stack...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-bananur-cream/30 border border-bananur-sand/80 rounded-lg text-xs focus:outline-none focus:border-bananur-gold"
          />
          <Search className="w-4 h-4 text-bananur-clay-light absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        
        {/* Dynamic Category filter drop-downs based on activeTab */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto animate-fade-in text-xs font-sans">
          <div className="flex items-center gap-2">
            <label className="text-xs font-mono text-bananur-clay-light shrink-0">Categoría:</label>
            <select
              id="inv-cat-selector"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="p-2 bg-white border border-bananur-sand rounded-xl text-xs font-medium text-bananur-clay cursor-pointer"
            >
              <option value="Todas">Todas las categorías</option>
              {activeTab === 'fisicos' && productCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              {activeTab === 'servicios' && serviceCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              {activeTab === 'portafolio' && portfolioCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Items per page selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-mono text-bananur-clay-light shrink-0">Ver:</label>
            <select
              id="inv-per-page-selector"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="p-2 bg-white border border-bananur-sand rounded-xl text-xs font-mono text-bananur-clay cursor-pointer"
            >
              <option value={6}>6 por pág.</option>
              <option value={12}>12 por pág.</option>
              <option value={24}>24 por pág.</option>
              <option value={48}>48 por pág.</option>
            </select>
          </div>

          {/* View mode toggle (Tarjetas vs Lista) */}
          <div className="flex items-center p-1 bg-white border border-bananur-sand rounded-xl shadow-3xs">
            <button
              id="inv-view-toggle-cards"
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                viewMode === 'cards'
                  ? 'bg-bananur-clay text-white shadow-xs'
                  : 'text-bananur-clay-light hover:text-bananur-clay hover:bg-bananur-sand/30'
              }`}
              title="Ver formato cuadrícula de tarjetas"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Tarjetas</span>
            </button>
            <button
              id="inv-view-toggle-table"
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                viewMode === 'table'
                  ? 'bg-bananur-clay text-white shadow-xs'
                  : 'text-bananur-clay-light hover:text-bananur-clay hover:bg-bananur-sand/30'
              }`}
              title="Ver formato tabla de lista"
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
          </div>
        </div>
      </div>

      {/* CORE PRODUCTS VIEW (CARDS OR TABLE) */}
      {activeTab === 'fisicos' && (
        <div className="space-y-4">
          {viewMode === 'cards' ? (
            /* Cards View for Products */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
              {paginatedProducts.length === 0 ? (
                <div className="col-span-full bg-white p-12 rounded-2xl border border-bananur-sand text-center text-bananur-clay-light">
                  <p className="font-serif font-bold text-sm text-bananur-clay">No se encontraron productos</p>
                  <p className="text-xs mt-1">Prueba cambiando la búsqueda o los filtros de categoría.</p>
                </div>
              ) : (
                paginatedProducts.map((p) => {
                  const isLow = p.stock <= p.lowStockThreshold;
                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-2xl border border-bananur-sand overflow-hidden shadow-3xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div className="relative aspect-4/3 bg-bananur-sand/30 overflow-hidden">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-bananur-clay/90 text-white backdrop-blur-xs">
                            {p.category}
                          </span>
                          {p.category.toLowerCase() === 'ropa' && p.clothingType === 'vintage' && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500 text-white flex items-center gap-1 shadow-xs">
                              <Scale className="w-2.5 h-2.5" /> Vintage {p.weightGrams ? `• ${p.weightGrams}g` : ''}
                            </span>
                          )}
                          {p.category.toLowerCase() === 'ropa' && p.clothingType === 'nueva' && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                              <Shirt className="w-2.5 h-2.5" /> Nueva
                            </span>
                          )}
                        </div>
                        <div className="absolute top-2.5 right-2.5">
                          <span className={`px-2 py-0.5 text-[9px] font-bold font-mono rounded-full border shadow-xs ${
                            p.stock > 0 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}>
                            {p.stock > 0 ? `${p.stock} un.` : 'Agotado'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-[10px] font-mono text-bananur-clay-light mb-1">
                            <span>{p.id}</span>
                            {p.lotCode && (
                              <span className="bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold border border-amber-300" title={p.lotName || 'Lote Textil'}>
                                {p.lotCode}
                              </span>
                            )}
                          </div>
                          <h4 className="font-serif font-bold text-sm text-bananur-clay line-clamp-2 leading-snug">
                            {p.name}
                          </h4>
                          <div className="mt-2">
                            <BarcodeBadge code={p.code || p.sku || p.id} label={p.name} price={p.price} size="xs" showLabelModal={true} />
                          </div>
                          {p.category.toLowerCase() === 'ropa' && p.pricePerKg && (
                            <span className="text-[10px] font-mono text-bananur-gold-dark block mt-1">
                              Tasación: ${p.pricePerKg.toLocaleString('es-CL')}/kg
                            </span>
                          )}
                        </div>

                        <div className="pt-2 border-t border-bananur-sand/50 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-bananur-clay-light block font-mono">Precio Retail</span>
                            <span className="font-mono text-base font-bold text-bananur-clay">
                              ${p.price.toLocaleString('es-CL')}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              id={`inv-btn-card-edit-${p.id}`}
                              onClick={() => handleStartEditProduct(p)}
                              className="p-2 hover:bg-bananur-sand rounded-xl text-bananur-clay-light hover:text-bananur-clay transition-colors cursor-pointer"
                              title="Editar Producto"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              id={`inv-btn-card-dup-${p.id}`}
                              onClick={() => triggerDuplicate(p.id)}
                              className="p-2 hover:bg-bananur-sand rounded-xl text-bananur-clay-light hover:text-[#7C9A74] transition-colors cursor-pointer"
                              title="Duplicar Objeto"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              id={`inv-btn-card-delete-${p.id}`}
                              onClick={() => setShowDeleteModal(p.id)}
                              className="p-2 hover:bg-rose-50 rounded-xl text-bananur-clay-light hover:text-bananur-coral transition-colors cursor-pointer"
                              title="Eliminar Objeto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Table View for Products */
            <div className="bg-white rounded-2xl border border-bananur-sand overflow-hidden shadow-sm animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-bananur-cream/50 border-b border-bananur-sand text-[10px] font-mono uppercase tracking-widest text-bananur-clay-light/80">
                      <th className="py-4 px-6">Foto</th>
                      <th className="py-4">Nombre / Objeto</th>
                      <th className="py-4">Categoría</th>
                      <th className="py-4">Precio CLP</th>
                      <th className="py-4">Stock</th>
                      <th className="py-4">Estado</th>
                      <th className="py-4 px-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bananur-sand/50 text-xs text-bananur-clay">
                    {paginatedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-bananur-clay-light italic">
                          No se encontraron productos con los filtros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      paginatedProducts.map((p) => {
                        const isLow = p.stock <= p.lowStockThreshold;
                        return (
                          <tr key={p.id} className="hover:bg-bananur-sand/10 transition-colors">
                            <td className="py-3 px-6">
                              <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-bananur-sand" />
                            </td>
                            <td className="py-3 font-semibold text-bananur-clay">
                              <span className="block mb-1">{p.name}</span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <BarcodeBadge code={p.code || p.sku || p.id} label={p.name} price={p.price} size="xs" showLabelModal={true} />
                                {p.category.toLowerCase() === 'ropa' && p.clothingType === 'vintage' && (
                                  <>
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-amber-100/70 text-amber-900 border border-amber-300 rounded text-[9px] font-mono font-bold">
                                      <Scale className="w-2.5 h-2.5" /> Vintage {p.weightGrams ? `• ${p.weightGrams}g` : ''}
                                    </span>
                                    {p.lotCode && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-amber-200/80 text-amber-950 border border-amber-400/80 rounded text-[9px] font-mono font-bold" title={p.lotName || 'Lote Textil'}>
                                        <Package className="w-2.5 h-2.5 text-amber-800" /> {p.lotCode}
                                      </span>
                                    )}
                                  </>
                                )}
                                {p.category.toLowerCase() === 'ropa' && p.clothingType === 'nueva' && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-emerald-100/70 text-emerald-900 border border-emerald-300 rounded text-[9px] font-mono font-bold">
                                    <Shirt className="w-2.5 h-2.5" /> Nueva
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 font-medium text-bananur-gold-dark">
                              <div>
                                <span>{p.category}</span>
                                {p.category.toLowerCase() === 'ropa' && p.pricePerKg && (
                                  <span className="block text-[9px] font-mono text-bananur-clay-light">
                                    ${p.pricePerKg.toLocaleString('es-CL')}/kg
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 font-mono font-bold">${p.price.toLocaleString('es-CL')}</td>
                            <td className="py-3">
                              <span className={`font-mono font-medium ${isLow ? 'text-bananur-coral font-bold' : 'text-bananur-clay'}`}>
                                {p.stock} unidades {isLow && '⚠️'}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold rounded-full border ${
                                p.stock > 0 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                                  : 'bg-rose-50 text-rose-700 border-rose-300'
                              }`}>
                                {p.stock > 0 ? 'Activo' : 'Sin Stock'}
                              </span>
                            </td>
                            <td className="py-3 px-6 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  id={`inv-btn-edit-${p.id}`}
                                  onClick={() => handleStartEditProduct(p)}
                                  className="p-1.5 hover:bg-bananur-sand rounded-lg text-bananur-clay-light hover:text-bananur-clay transition-colors cursor-pointer"
                                  title="Editar Producto"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  id={`inv-btn-dup-${p.id}`}
                                  onClick={() => triggerDuplicate(p.id)}
                                  className="p-1.5 hover:bg-bananur-sand rounded-lg text-bananur-clay-light hover:text-[#7C9A74] transition-colors cursor-pointer"
                                  title="Duplicar Objeto"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button
                                  id={`inv-btn-delete-${p.id}`}
                                  onClick={() => setShowDeleteModal(p.id)}
                                  className="p-1.5 hover:bg-rose-50 rounded-lg text-bananur-clay-light hover:text-bananur-coral transition-colors cursor-pointer"
                                  title="Desactivar / Eliminar Objeto"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Unified Pagination Bar for Products */}
          {activeItemsCount > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-bananur-sand text-xs font-mono shadow-3xs">
              <span className="text-bananur-clay-light">
                Mostrando <strong className="text-bananur-clay">{(effectivePage - 1) * itemsPerPage + 1}</strong> a <strong className="text-bananur-clay">{Math.min(effectivePage * itemsPerPage, activeItemsCount)}</strong> de <strong className="text-bananur-clay">{activeItemsCount}</strong> productos
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  id="inv-pagination-prev"
                  disabled={effectivePage <= 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 rounded-lg border border-bananur-sand bg-white text-bananur-clay hover:bg-bananur-sand/30 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 font-bold transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Anterior</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                        effectivePage === page
                          ? 'bg-bananur-clay text-white shadow-xs'
                          : 'bg-white border border-bananur-sand text-bananur-clay hover:bg-bananur-sand/30'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  id="inv-pagination-next"
                  disabled={effectivePage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-3 py-1.5 rounded-lg border border-bananur-sand bg-white text-bananur-clay hover:bg-bananur-sand/30 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 font-bold transition-colors"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TECHNICAL SERVICES UNIFIED VIEW */}
      {activeTab === 'servicios' && (
        <div className="space-y-4">
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {paginatedServices.length === 0 ? (
                <div className="col-span-full bg-white p-12 rounded-2xl border border-bananur-sand text-center text-bananur-clay-light">
                  <p className="font-serif font-bold text-sm text-bananur-clay">No se encontraron servicios</p>
                  <p className="text-xs mt-1">Prueba cambiando los filtros de categoría.</p>
                </div>
              ) : (
                paginatedServices.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-bananur-sand p-5 space-y-4 shadow-3xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-bananur-cream flex items-center justify-center border border-bananur-sand">
                          {renderServiceIcon(item.iconName)}
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold rounded-full border bg-emerald-50 text-emerald-700 border-emerald-300">
                          Disponible
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-bananur-clay-light mb-1">
                          <span>{item.id}</span>
                          <span className="text-bananur-gold-dark font-semibold">{item.category}</span>
                        </div>
                        <h4 className="font-serif font-bold text-base text-bananur-clay">{item.name}</h4>
                        <div className="mt-1.5 mb-1">
                          <BarcodeBadge code={item.code || item.id} label={item.name} price={item.price} size="xs" showLabelModal={true} />
                        </div>
                        <p className="text-xs text-bananur-clay-light mt-1 line-clamp-2">{item.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {item.details.map((det, idx) => (
                          <span key={idx} className="bg-bananur-sand/30 text-bananur-clay text-[9px] px-2 py-0.5 rounded-md border border-bananur-sand/40">
                            {det}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-bananur-sand/50 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-bananur-clay-light block font-mono">Arancel Estimado</span>
                        <span className="font-mono text-base font-bold text-bananur-clay">
                          Desde ${item.price.toLocaleString('es-CL')}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          id={`srv-btn-card-edit-${item.id}`}
                          onClick={() => handleStartEditService(item)}
                          className="p-2 hover:bg-bananur-sand rounded-xl text-bananur-clay-light hover:text-bananur-clay transition-colors cursor-pointer"
                          title="Editar Servicio"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {onDeleteService && (
                          <button
                            id={`srv-btn-card-delete-${item.id}`}
                            onClick={() => onDeleteService(item.id)}
                            className="p-2 hover:bg-rose-50 rounded-xl text-bananur-clay-light hover:text-bananur-coral transition-colors cursor-pointer"
                            title="Eliminar Servicio"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-bananur-sand overflow-hidden shadow-sm animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-bananur-cream/50 border-b border-bananur-sand text-[10px] font-mono uppercase tracking-widest text-bananur-clay-light/80">
                      <th className="py-4 px-6">Icono</th>
                      <th className="py-4">Nombre del Servicio</th>
                      <th className="py-4">Categoría</th>
                      <th className="py-4">Precio Referencial</th>
                      <th className="py-4">Entregables Clave</th>
                      <th className="py-4">Estado</th>
                      <th className="py-4 px-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bananur-sand/50 text-xs text-bananur-clay">
                    {paginatedServices.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-xs text-bananur-clay-light py-8 text-center bg-white">
                          No se encontraron servicios asignables para mostrar.
                        </td>
                      </tr>
                    ) : (
                      paginatedServices.map((item) => (
                        <tr key={item.id} className="hover:bg-bananur-sand/10 transition-colors">
                          <td className="py-3 px-6">
                            <div className="w-9 h-9 rounded-xl bg-bananur-cream flex items-center justify-center border border-bananur-sand">
                              {renderServiceIcon(item.iconName)}
                            </div>
                          </td>
                          <td className="py-3 font-semibold text-bananur-clay">
                            <span className="block mb-1">{item.name}</span>
                            <BarcodeBadge code={item.code || item.id} label={item.name} price={item.price} size="xs" showLabelModal={true} />
                          </td>
                          <td className="py-3 font-medium text-bananur-gold-dark">{item.category}</td>
                          <td className="py-3 font-mono font-bold">Desde ${item.price.toLocaleString('es-CL')}</td>
                          <td className="py-3">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {item.details.slice(0, 2).map((det, idx) => (
                                <span key={idx} className="bg-bananur-sand/30 text-bananur-clay text-[9px] px-1.5 py-0.5 rounded border border-bananur-sand/40">
                                  {det}
                                </span>
                              ))}
                              {item.details.length > 2 && (
                                <span className="text-[10px] text-bananur-clay-light/60 font-mono">+{item.details.length - 2} más</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold rounded-full border bg-emerald-50 text-emerald-700 border-emerald-300">
                              Disponible
                            </span>
                          </td>
                          <td className="py-3 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                id={`srv-btn-edit-${item.id}`}
                                onClick={() => handleStartEditService(item)}
                                className="p-1.5 hover:bg-bananur-sand rounded-lg text-bananur-clay-light hover:text-bananur-clay transition-colors cursor-pointer"
                                title="Editar Servicio"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {onDeleteService && (
                                <button
                                  id={`srv-btn-delete-${item.id}`}
                                  onClick={() => onDeleteService(item.id)}
                                  className="p-1.5 hover:bg-rose-50 rounded-lg text-bananur-clay-light hover:text-bananur-coral transition-colors cursor-pointer"
                                  title="Eliminar Servicio del Taller"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination for Services */}
          {activeItemsCount > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-bananur-sand text-xs font-mono shadow-3xs">
              <span className="text-bananur-clay-light">
                Mostrando <strong className="text-bananur-clay">{(effectivePage - 1) * itemsPerPage + 1}</strong> a <strong className="text-bananur-clay">{Math.min(effectivePage * itemsPerPage, activeItemsCount)}</strong> de <strong className="text-bananur-clay">{activeItemsCount}</strong> servicios
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={effectivePage <= 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 rounded-lg border border-bananur-sand bg-white text-bananur-clay hover:bg-bananur-sand/30 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 font-bold"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Anterior
                </button>
                <button
                  type="button"
                  disabled={effectivePage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-3 py-1.5 rounded-lg border border-bananur-sand bg-white text-bananur-clay hover:bg-bananur-sand/30 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 font-bold"
                >
                  Siguiente <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PORTFOLIO CASOS & PROYECTOS UNIFIED VIEW */}
      {activeTab === 'portafolio' && (
        <div className="space-y-4">
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {paginatedPortfolio.length === 0 ? (
                <div className="col-span-full bg-white p-12 rounded-2xl border border-bananur-sand text-center text-bananur-clay-light">
                  <p className="font-serif font-bold text-sm text-bananur-clay">No se encontraron casos de portafolio</p>
                </div>
              ) : (
                paginatedPortfolio.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-bananur-sand overflow-hidden shadow-3xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="relative aspect-16/10 bg-bananur-sand/30 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-bananur-clay/90 text-white backdrop-blur-xs">
                          {item.category}
                        </span>
                      </div>
                      <div className="absolute top-2.5 right-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-700 text-white shadow-xs">
                          Publicado
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-[#B58455] font-semibold block mb-0.5">Cliente: {item.client}</span>
                        <h4 className="font-serif font-bold text-base text-bananur-clay">{item.name}</h4>
                        <p className="text-xs text-bananur-clay-light mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {item.stack.map((tech) => (
                            <span key={tech} className="bg-bananur-cream/60 text-bananur-clay px-1.5 py-0.5 rounded text-[9px] font-mono border border-bananur-sand/40">
                              {tech}
                            </span>
                          ))}
                        </div>

                        {item.result && (
                          <div className="bg-emerald-50 text-emerald-800 p-2 rounded-lg text-[10px] font-mono font-bold border border-emerald-200">
                            ★ Logro: {item.result}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-bananur-sand/50 flex items-center justify-end gap-1">
                        <button
                          id={`port-btn-card-edit-${item.id}`}
                          onClick={() => handleStartEditPortfolio(item)}
                          className="p-2 hover:bg-bananur-sand rounded-xl text-bananur-clay-light hover:text-bananur-clay transition-colors cursor-pointer"
                          title="Editar Caso"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {onDeletePortfolioItem && (
                          <button
                            id={`port-btn-card-delete-${item.id}`}
                            onClick={() => onDeletePortfolioItem(item.id)}
                            className="p-2 hover:bg-rose-50 rounded-xl text-bananur-clay-light hover:text-bananur-coral transition-colors cursor-pointer"
                            title="Eliminar Caso"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-bananur-sand overflow-hidden shadow-sm animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-bananur-cream/50 border-b border-bananur-sand text-[10px] font-mono uppercase tracking-widest text-bananur-clay-light/80">
                      <th className="py-4 px-6">Showcase</th>
                      <th className="py-4">Nombre / Cliente</th>
                      <th className="py-4">Área de Trabajo</th>
                      <th className="py-4">Herramientas / Stack</th>
                      <th className="py-4">Métrica Lograda</th>
                      <th className="py-4">Estado</th>
                      <th className="py-4 px-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bananur-sand/50 text-xs text-bananur-clay">
                    {paginatedPortfolio.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-xs text-bananur-clay-light py-8 text-center bg-white">
                          No se encontraron casos de estudio en este filtro de portafolio.
                        </td>
                      </tr>
                    ) : (
                      paginatedPortfolio.map((item) => (
                        <tr key={item.id} className="hover:bg-bananur-sand/10 transition-colors">
                          <td className="py-3 px-6">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-12 h-12 object-cover rounded-xl bg-bananur-sand border border-bananur-sand" 
                            />
                          </td>
                          <td className="py-3 font-semibold text-bananur-clay">
                            <span className="block mb-0.5">{item.name}</span>
                            <span className="text-[10px] text-[#B58455] font-semibold">Cliente: {item.client}</span>
                          </td>
                          <td className="py-3 font-medium text-bananur-gold-dark">{item.category}</td>
                          <td className="py-3">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {item.stack.map((tech) => (
                                <span key={tech} className="bg-bananur-cream/60 text-bananur-clay px-1.5 py-0.5 rounded text-[9px] font-mono border border-bananur-sand/40">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3">
                            {item.result ? (
                              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-250">
                                {item.result}
                              </span>
                            ) : (
                              <span className="text-bananur-clay-light font-light text-[11px] italic">No declarada</span>
                            )}
                          </td>
                          <td className="py-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-full border bg-emerald-50 text-emerald-700 border-emerald-300 uppercase">
                              Publicado
                            </span>
                          </td>
                          <td className="py-3 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                id={`port-btn-edit-${item.id}`}
                                onClick={() => handleStartEditPortfolio(item)}
                                className="p-1.5 hover:bg-bananur-sand rounded-lg text-bananur-clay-light hover:text-bananur-clay transition-colors cursor-pointer"
                                title="Editar Caso de Portafolio"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {onDeletePortfolioItem && (
                                <button
                                  id={`port-btn-delete-${item.id}`}
                                  onClick={() => onDeletePortfolioItem(item.id)}
                                  className="p-1.5 hover:bg-rose-50 rounded-lg text-bananur-clay-light hover:text-bananur-coral transition-colors cursor-pointer"
                                  title="Eliminar Caso de Portafolio"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination for Portfolio */}
          {activeItemsCount > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-bananur-sand text-xs font-mono shadow-3xs">
              <span className="text-bananur-clay-light">
                Mostrando <strong className="text-bananur-clay">{(effectivePage - 1) * itemsPerPage + 1}</strong> a <strong className="text-bananur-clay">{Math.min(effectivePage * itemsPerPage, activeItemsCount)}</strong> de <strong className="text-bananur-clay">{activeItemsCount}</strong> proyectos
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={effectivePage <= 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 rounded-lg border border-bananur-sand bg-white text-bananur-clay hover:bg-bananur-sand/30 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 font-bold"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Anterior
                </button>
                <button
                  type="button"
                  disabled={effectivePage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-3 py-1.5 rounded-lg border border-bananur-sand bg-white text-bananur-clay hover:bg-bananur-sand/30 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 font-bold"
                >
                  Siguiente <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: FLOATING NEW OBJECT CREATION */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-bananur-clay/70 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="relative bg-white max-w-xl w-full rounded-2xl shadow-xl overflow-hidden z-10 border border-bananur-sand animate-scale-up max-h-[90vh] flex flex-col">
            
            <div className="bg-bananur-cream p-5 border-b border-bananur-sand flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-serif text-lg font-bold text-bananur-clay">
                  Registrar Nuevo Contenido
                </h3>
                <p className="text-[10px] text-bananur-clay-light font-mono uppercase">Selecciona el formato de publicación dentro de la marca.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-bananur-clay hover:text-bananur-gold p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Selector Tabs */}
            <div className="flex border-b border-bananur-sand bg-bananur-cream/40 p-2 gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setCreatedItemType('producto')}
                className={`flex-1 py-2 text-center rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer uppercase font-mono ${
                  createdItemType === 'producto'
                    ? 'bg-bananur-clay text-bananur-cream shadow-sm'
                    : 'text-bananur-clay-light hover:bg-bananur-sand/30 hover:text-bananur-clay'
                }`}
              >
                Producto Físico
              </button>
              <button
                type="button"
                id="btn-select-serv"
                onClick={() => setCreatedItemType('servicio')}
                className={`flex-1 py-2 text-center rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer uppercase font-mono ${
                  createdItemType === 'servicio'
                    ? 'bg-bananur-clay text-bananur-cream shadow-sm'
                    : 'text-bananur-clay-light hover:bg-bananur-sand/30 hover:text-bananur-clay'
                }`}
              >
                Servicios
              </button>
              <button
                type="button"
                id="btn-select-port"
                onClick={() => setCreatedItemType('portafolio')}
                className={`flex-1 py-2 text-center rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer uppercase font-mono ${
                  createdItemType === 'portafolio'
                    ? 'bg-bananur-clay text-bananur-cream shadow-sm'
                    : 'text-bananur-clay-light hover:bg-bananur-sand/30 hover:text-bananur-clay'
                }`}
              >
                Portafolio Digital
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {createdItemType === 'producto' && (
                <div className="space-y-4 animate-fade-in text-xs font-sans text-bananur-clay">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Nombre de Objeto</label>
                      <input
                        id="new-prod-name"
                        type="text"
                        required
                        placeholder="Ej. Vela de Soya Orgánica"
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Categoría Boutique</label>
                      <select
                        id="new-prod-cat"
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-white text-bananur-clay font-bold cursor-pointer"
                      >
                        {productCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* ROPA SPECIALIZED SUB-CATEGORY SELECTOR */}
                  {newProdCategory.toLowerCase() === 'ropa' && (
                    <div className="bg-bananur-cream/80 border border-bananur-sand rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay flex items-center gap-1.5">
                          <Shirt className="w-3.5 h-3.5 text-bananur-gold-dark" />
                          Subcategoría Textil
                        </label>
                        <span className="text-[10px] font-mono text-bananur-clay-light">Selecciona el tipo de prenda</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          id="btn-clothing-new"
                          onClick={() => setNewClothingType('nueva')}
                          className={`p-2.5 rounded-lg border text-left flex flex-col gap-0.5 cursor-pointer transition-all ${
                            newClothingType === 'nueva'
                              ? 'bg-white border-emerald-500 text-emerald-900 shadow-xs ring-1 ring-emerald-400/50'
                              : 'bg-white/60 border-bananur-sand text-bananur-clay-light hover:bg-white'
                          }`}
                        >
                          <span className="font-bold text-xs flex items-center gap-1">
                            ✨ Ropa Nueva
                          </span>
                          <span className="text-[10px] opacity-80">Prenda nueva estándar con precio fijo</span>
                        </button>

                        <button
                          type="button"
                          id="btn-clothing-vintage"
                          onClick={() => {
                            setNewClothingType('vintage');
                            const weight = Number(newProdWeightGrams) || 350;
                            const rate = Number(newProdPricePerKg) || 24000;
                            setNewProdPrice(String(Math.round((weight / 1000) * rate)));
                          }}
                          className={`p-2.5 rounded-lg border text-left flex flex-col gap-0.5 cursor-pointer transition-all ${
                            newClothingType === 'vintage'
                              ? 'bg-amber-50/90 border-amber-500 text-amber-950 shadow-xs ring-1 ring-amber-400/50'
                              : 'bg-white/60 border-bananur-sand text-bananur-clay-light hover:bg-white'
                          }`}
                        >
                          <span className="font-bold text-xs flex items-center gap-1">
                            <Scale className="w-3.5 h-3.5 text-amber-700" /> Ropa Vintage (Por Peso)
                          </span>
                          <span className="text-[10px] opacity-80">Calcular precio según gramaje / kg</span>
                        </button>
                      </div>

                      {/* VINTAGE WEIGHT & LOT CALCULATOR PANEL */}
                      {newClothingType === 'vintage' && (
                        <div className="mt-2 bg-amber-100/60 border border-amber-300 rounded-xl p-3.5 space-y-3 shadow-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs font-mono">
                              <Calculator className="w-3.5 h-3.5 text-amber-800" />
                              Calculadora por Gramaje & Identificación de Fardo
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowNewLotForm(!showNewLotForm)}
                              className="text-[10px] font-mono font-bold text-amber-900 hover:text-amber-950 bg-amber-200/90 hover:bg-amber-300 px-2 py-0.5 rounded-md border border-amber-400/80 flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              {showNewLotForm ? 'Cerrar Registro' : '+ Registrar Nuevo Fardo'}
                            </button>
                          </div>

                          {/* INLINE NEW LOT CREATION FORM */}
                          {showNewLotForm && (
                            <div className="bg-white border border-amber-400 rounded-lg p-3 space-y-2.5 shadow-xs">
                              <div className="flex items-center justify-between border-b border-amber-200 pb-1.5">
                                <span className="text-[11px] font-mono font-bold text-amber-950 flex items-center gap-1">
                                  <Package className="w-3.5 h-3.5 text-amber-700" /> Alta de Nuevo Lote / Fardo Textil
                                </span>
                                <span className="text-[10px] font-mono text-amber-700">Se asignará automáticamente</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                <div>
                                  <label className="block text-[10px] font-mono font-bold text-amber-950 mb-0.5">
                                    Código de Fardo (ej. FRD-2024-05) *
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="FRD-2024-05"
                                    value={createLotCode}
                                    onChange={(e) => setCreateLotCode(e.target.value.toUpperCase())}
                                    className="w-full p-1.5 bg-amber-50/50 border border-amber-300 rounded font-mono font-bold text-xs text-amber-950"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-mono font-bold text-amber-950 mb-0.5">
                                    Nombre o Descripción del Fardo *
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Fardo Trench & Abrigos Lana"
                                    value={createLotName}
                                    onChange={(e) => setCreateLotName(e.target.value)}
                                    className="w-full p-1.5 bg-amber-50/50 border border-amber-300 rounded text-xs text-amber-950"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-mono font-bold text-amber-950 mb-0.5">
                                    Precio Total del Fardo ($ CLP) *
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    placeholder="1260000"
                                    value={createLotTotalPrice}
                                    onChange={(e) => setCreateLotTotalPrice(e.target.value)}
                                    className="w-full p-1.5 bg-amber-50/50 border border-amber-300 rounded font-mono font-bold text-xs text-amber-950"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-mono font-bold text-amber-950 mb-0.5">
                                    Peso Total del Fardo (Kg) *
                                  </label>
                                  <input
                                    type="number"
                                    min="0.1"
                                    step="any"
                                    placeholder="45"
                                    value={createLotWeightKg}
                                    onChange={(e) => setCreateLotWeightKg(e.target.value)}
                                    className="w-full p-1.5 bg-amber-50/50 border border-amber-300 rounded font-mono font-bold text-xs text-amber-950"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-mono font-bold text-amber-950 mb-0.5 flex items-center justify-between">
                                    <span>Tarifa Fija por Kilo ($ CLP/kg) *</span>
                                    <span className="text-[9px] text-amber-700 font-normal">Precio ÷ Peso</span>
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    placeholder="28000"
                                    value={createLotPricePerKg}
                                    onChange={(e) => setCreateLotPricePerKg(e.target.value)}
                                    className="w-full p-1.5 bg-amber-100/70 border border-amber-400 rounded font-mono font-bold text-xs text-amber-950"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-mono font-bold text-amber-950 mb-0.5">
                                    Origen / Proveedor (Opcional)
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Importación Directa USA"
                                    value={createLotOrigin}
                                    onChange={(e) => setCreateLotOrigin(e.target.value)}
                                    className="w-full p-1.5 bg-amber-50/50 border border-amber-300 rounded text-xs text-amber-950"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-[10px] text-amber-800">
                                  💡 Gestión global disponible en Insumos y Materias Primas (MRP)
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setShowNewLotForm(false)}
                                    className="px-2.5 py-1 text-[11px] font-mono border border-bananur-sand rounded text-bananur-clay hover:bg-bananur-sand/30"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAddNewLot(false)}
                                    disabled={!createLotCode.trim() || !createLotName.trim()}
                                    className="px-3 py-1 text-[11px] font-mono font-bold bg-amber-600 hover:bg-amber-700 text-white rounded shadow-xs disabled:opacity-50 cursor-pointer"
                                  >
                                    Guardar y Seleccionar Fardo
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* LOT SELECTION DROPDOWN & INFO */}
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-mono font-bold text-amber-950 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <Boxes className="w-3.5 h-3.5 text-amber-800" />
                                Fardo / Lote de Origen de la Prenda
                              </span>
                              <span className="text-[10px] text-amber-800 font-normal">Diferencia la tarifa de cada fardo</span>
                            </label>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div className="sm:col-span-2">
                                <select
                                  id="new-prod-lot-select"
                                  value={newProdLotId}
                                  onChange={(e) => handleSelectLot(e.target.value, false)}
                                  className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-mono font-medium text-amber-950 focus:ring-1 focus:ring-amber-500"
                                >
                                  {availableLots.map((lot) => (
                                    <option key={lot.id} value={lot.id}>
                                      📦 [{lot.code}] {lot.name} — (${lot.pricePerKg.toLocaleString('es-CL')}/kg)
                                    </option>
                                  ))}
                                  <option value="custom">⚙️ Lote Manual / Personalizado</option>
                                </select>
                              </div>

                              <div>
                                <input
                                  type="text"
                                  placeholder="Código Lote"
                                  value={newProdLotCode}
                                  onChange={(e) => setNewProdLotCode(e.target.value.toUpperCase())}
                                  className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold text-amber-950"
                                  title="Código de identificación del lote"
                                />
                              </div>
                            </div>

                            {/* ACTIVE LOT INFO CARD */}
                            {(() => {
                              const activeLot = availableLots.find(l => l.id === newProdLotId);
                              if (!activeLot) return null;
                              return (
                                <div className="bg-amber-200/40 border border-amber-300/70 rounded-lg p-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] font-mono text-amber-950">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold bg-amber-300/80 px-1.5 py-0.5 rounded text-amber-950">
                                      {activeLot.code}
                                    </span>
                                    <span className="font-medium">{activeLot.name}</span>
                                    {activeLot.origin && (
                                      <span className="text-amber-800 text-[10px]">({activeLot.origin})</span>
                                    )}
                                  </div>
                                  <div className="font-bold text-amber-900 shrink-0">
                                    Tarifa Fardo: ${activeLot.pricePerKg.toLocaleString('es-CL')}/kg
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                          {/* WEIGHT PRESETS CHIPS */}
                          <div className="space-y-1">
                            <label className="block text-[10px] font-mono font-bold text-amber-950 uppercase tracking-wider">
                              Referencia Rápida de Gramaje (Opcional):
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                { label: 'Polera', g: '200' },
                                { label: 'Camisa', g: '320' },
                                { label: 'Pantalón/Jeans', g: '650' },
                                { label: 'Polerón', g: '750' },
                                { label: 'Chaqueta', g: '950' },
                                { label: 'Abrigo', g: '1400' },
                              ].map((p) => (
                                <button
                                  key={p.label}
                                  type="button"
                                  onClick={() => {
                                    setNewProdWeightGrams(p.g);
                                    const w = Number(p.g) || 0;
                                    const r = Number(newProdPricePerKg) || 0;
                                    setNewProdPrice(String(Math.round((w / 1000) * r)));
                                  }}
                                  className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors cursor-pointer ${
                                    newProdWeightGrams === p.g
                                      ? 'bg-amber-400 text-amber-950 font-bold border-amber-500'
                                      : 'bg-white/80 text-amber-900 border-amber-300 hover:bg-amber-200'
                                  }`}
                                >
                                  {p.label} ({p.g}g)
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div>
                              <label className="block text-[11px] font-mono font-bold text-amber-950 mb-1">
                                Peso de esta prenda (Gramos) *
                              </label>
                              <div className="relative">
                                <input
                                  id="new-prod-weight"
                                  type="number"
                                  min="0"
                                  step="any"
                                  placeholder="Ej. 350"
                                  value={newProdWeightGrams}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setNewProdWeightGrams(val);
                                    const w = Number(val) || 0;
                                    const r = Number(newProdPricePerKg) || 0;
                                    setNewProdPrice(String(Math.round((w / 1000) * r)));
                                  }}
                                  className="w-full p-2 bg-white border border-amber-300 rounded text-xs font-mono font-bold text-amber-950 pr-12"
                                />
                                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-amber-800 font-bold">
                                  {Number(newProdWeightGrams) > 0 ? `${(Number(newProdWeightGrams) / 1000).toFixed(2)} kg` : 'g'}
                                </span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-mono font-bold text-amber-950 mb-1">
                                Tarifa de este fardo ($ CLP/kg) *
                              </label>
                              <input
                                id="new-prod-rate-kg"
                                type="number"
                                min="0"
                                step="any"
                                placeholder="Ej. 28000"
                                value={newProdPricePerKg}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setNewProdPricePerKg(val);
                                  const w = Number(newProdWeightGrams) || 0;
                                  const r = Number(val) || 0;
                                  setNewProdPrice(String(Math.round((w / 1000) * r)));
                                }}
                                className="w-full p-2 bg-white border border-amber-300 rounded text-xs font-mono font-bold text-amber-950"
                              />
                            </div>
                          </div>

                          <div className="bg-white/90 p-2.5 rounded-lg border border-amber-200 text-[11px] font-mono text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
                            <div>
                              <span className="text-amber-800 font-bold">Fórmula {newProdLotCode ? `[${newProdLotCode}]` : ''}: </span>
                              <span>{Number(newProdWeightGrams) || 0}g ({( (Number(newProdWeightGrams) || 0) / 1000 ).toFixed(3)} kg) × ${(Number(newProdPricePerKg) || 0).toLocaleString('es-CL')}/kg</span>
                            </div>
                            <div className="font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded border border-emerald-300">
                              = ${(Math.round(((Number(newProdWeightGrams) || 0) / 1000) * (Number(newProdPricePerKg) || 0))).toLocaleString('es-CL')} CLP
                            </div>
                          </div>

                          <p className="text-[10px] font-mono text-amber-800/90">
                            * Cada prenda vintage tiene un peso propio independiente; este valor es referencial para tasar el costo de adquisición de esta unidad.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CÓDIGO ÚNICO / SKU / BARRAS */}
                  <div className="bg-amber-50/60 border border-amber-300/80 rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                        <Barcode className="w-4 h-4 text-amber-700" />
                        Código Único / SKU / Código de Barras *
                      </label>
                      <button
                        type="button"
                        onClick={() => setNewProdCode(generateUniqueCode('product', newProdCategory))}
                        className="text-[10px] font-mono text-amber-900 hover:text-amber-950 flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded border border-amber-300 font-semibold"
                        title="Generar nuevo código"
                      >
                        <RefreshCw className="w-3 h-3" /> Auto-generar
                      </button>
                    </div>
                    <input
                      id="new-prod-code"
                      type="text"
                      required
                      placeholder="BNN-PRD-1234"
                      value={newProdCode}
                      onChange={(e) => setNewProdCode(e.target.value.toUpperCase())}
                      className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold text-amber-950 tracking-wider uppercase"
                    />
                    <p className="text-[10px] font-mono text-amber-800/80">
                      Código único para inventarios, impresión de etiquetas adhesivas y escaneo en venta directa (POS).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">
                        {newProdCategory.toLowerCase() === 'ropa' && newClothingType === 'vintage' ? 'Precio Final Calculado CLP ($)' : 'Precio CLP ($)'}
                      </label>
                      <input
                        id="new-prod-price"
                        type="number"
                        min="1"
                        required
                        placeholder="19990"
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30 font-mono font-bold text-bananur-clay"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Unidades en Stock</label>
                      <input
                        id="new-prod-stock"
                        type="number"
                        min="0"
                        required
                        placeholder="15"
                        value={newProdStock}
                        onChange={(e) => setNewProdStock(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30"
                      />
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-bananur-sand rounded-xl p-4 text-center bg-bananur-cream/10 space-y-2">
                    <div className="flex justify-center flex-col items-center gap-1">
                      <Upload className="w-5 h-5 text-bananur-gold-dark" />
                      <span className="text-xs text-bananur-clay-light font-semibold">Cargar imagen de catálogo</span>
                      <span className="text-[10px] text-bananur-clay-light/50 font-mono">Entrega una URL pública para el mockup</span>
                    </div>
                    <div className="flex gap-2 items-center justify-center">
                      <input
                        id="new-prod-img"
                        type="text"
                        value={newProdImage}
                        onChange={(e) => setNewProdImage(e.target.value)}
                        className="p-1.5 px-2 border border-bananur-sand rounded text-[10px] bg-white w-full text-center truncate font-mono"
                        title="URL de Imagen"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Descripción de Origen</label>
                    <textarea
                      id="new-prod-desc"
                      rows={3}
                      placeholder="Redacta la historia y material de este objeto de autor..."
                      value={newProdDesc}
                      onChange={(e) => setNewProdDesc(e.target.value)}
                      className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30"
                    />
                  </div>
                </div>
              )}

              {createdItemType === 'servicio' && (
                <div className="space-y-4 animate-fade-in text-xs text-bananur-clay">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Nombre del Servicio</label>
                      <input
                        id="new-serv-name"
                        type="text"
                        required
                        placeholder="Ej. Identidad de Marca Editorial"
                        value={newServName}
                        onChange={(e) => setNewServName(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Categoría Técnica</label>
                      <select
                        id="new-serv-cat"
                        value={newServCategory}
                        onChange={(e) => setNewServCategory(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-white text-bananur-clay font-bold cursor-pointer"
                      >
                        {serviceCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* CÓDIGO ÚNICO DE SERVICIO */}
                  <div className="bg-amber-50/60 border border-amber-300/80 rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                        <Barcode className="w-4 h-4 text-amber-700" />
                        Código Único de Servicio *
                      </label>
                      <button
                        type="button"
                        onClick={() => setNewServCode(generateUniqueCode('service', newServCategory))}
                        className="text-[10px] font-mono text-amber-900 hover:text-amber-950 flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded border border-amber-300 font-semibold"
                        title="Generar nuevo código"
                      >
                        <RefreshCw className="w-3 h-3" /> Auto-generar
                      </button>
                    </div>
                    <input
                      id="new-serv-code"
                      type="text"
                      required
                      placeholder="BNN-SRV-1001"
                      value={newServCode}
                      onChange={(e) => setNewServCode(e.target.value.toUpperCase())}
                      className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold text-amber-950 tracking-wider uppercase"
                    />
                    <p className="text-[10px] font-mono text-amber-800/80">
                      Código rápido para cotizar o registrar ventas en terminales POS con pistola o teclado.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Precio Desde/Neto ($ CLP)</label>
                      <input
                        id="new-serv-price"
                        type="number"
                        min="1"
                        required
                        placeholder="450000"
                        value={newServPrice}
                        onChange={(e) => setNewServPrice(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Icono Asociado (Lucide)</label>
                      <select
                        id="new-serv-icon"
                        value={newServIcon}
                        onChange={(e) => setNewServIcon(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-white text-bananur-clay font-bold cursor-pointer"
                      >
                        <option value="Sparkles">Destellos (Sparkles)</option>
                        <option value="Globe">Mundo (Globe)</option>
                        <option value="Layers">Capas (Layers)</option>
                        <option value="BookOpen">Libro Abierto (BookOpen)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Características / Entregables (Separados por Comas)</label>
                    <input
                      id="new-serv-details"
                      type="text"
                      placeholder="Ej. Propuesta conceptual, Manual, Archivos PDF finales"
                      value={newServDetailsForm}
                      onChange={(e) => setNewServDetailsForm(e.target.value)}
                      className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Descripción Técnica del Servicio</label>
                    <textarea
                      id="new-serv-desc"
                      rows={3}
                      placeholder="Indica la metodología y alcances..."
                      value={newServDesc}
                      onChange={(e) => setNewServDesc(e.target.value)}
                      className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30"
                    />
                  </div>
                </div>
              )}

              {createdItemType === 'portafolio' && (
                <div className="space-y-4 animate-fade-in text-xs text-bananur-clay">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Nombre del Proyecto</label>
                      <input
                        id="new-port-name"
                        type="text"
                        required
                        placeholder="Ej. Rediseño La Sombra"
                        value={newPortName}
                        onChange={(e) => setNewPortName(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Cliente / Marca</label>
                      <input
                        id="new-port-client"
                        type="text"
                        placeholder="Ej. Sombrería de Autor S.A."
                        value={newPortClient}
                        onChange={(e) => setNewPortClient(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Área de Portafolio</label>
                      <select
                        id="new-port-cat"
                        value={newPortCategory}
                        onChange={(e) => setNewPortCategory(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-white text-bananur-clay font-bold cursor-pointer"
                      >
                        {portfolioCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Herramientas/Stack (Comas)</label>
                      <input
                        id="new-port-stack"
                        type="text"
                        placeholder="Ej. Figma, Tailwind, Shopify, Liquid"
                        value={newPortStack}
                        onChange={(e) => setNewPortStack(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">URL Imagen de Showcase</label>
                    <input
                      id="new-port-image"
                      type="text"
                      placeholder="https://..."
                      value={newPortImage}
                      onChange={(e) => setNewPortImage(e.target.value)}
                      className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30 font-mono text-[10px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Problema del Cliente</label>
                      <textarea
                        id="new-port-prob"
                        rows={2}
                        placeholder="¿Qué desafío tenía el negocio?"
                        value={newPortProblem}
                        onChange={(e) => setNewPortProblem(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Nuestra Solución</label>
                      <textarea
                        id="new-port-sol"
                        rows={2}
                        placeholder="¿Cómo lo resolvimos creativamente?"
                        value={newPortSolution}
                        onChange={(e) => setNewPortSolution(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Resultado Concreto</label>
                      <input
                        id="new-port-result"
                        type="text"
                        placeholder="Ej. +42% ticket promedio, primer mes"
                        value={newPortResult}
                        onChange={(e) => setNewPortResult(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Resumen de Portada</label>
                      <input
                        id="new-port-desc"
                        type="text"
                        placeholder="Ej. Rediseño editorial y Shopify a medida..."
                        value={newPortDesc}
                        onChange={(e) => setNewPortDesc(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-bananur-sand shrink-0">
                <button
                  id="new-prod-btn-cancel"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-lg border border-bananur-sand text-xs text-bananur-clay font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="new-prod-btn-submit"
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-bananur-clay text-bananur-cream text-xs font-bold hover:bg-bananur-gold hover:text-bananur-clay cursor-pointer"
                >
                  {createdItemType === 'producto' ? 'Crear Producto' : createdItemType === 'servicio' ? 'Crear Servicio' : 'Crear Proyecto'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* FLOATING EDIT MODAL */}
      {editingItemType !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-bananur-clay/70 backdrop-blur-sm" onClick={() => setEditingItemType(null)}></div>
          <div className="relative bg-white max-w-xl w-full rounded-2xl shadow-xl overflow-hidden z-10 border border-bananur-sand animate-scale-up max-h-[90vh] flex flex-col">
            
            <div className="bg-[#B58455]/10 p-5 border-b border-bananur-sand flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-serif text-lg font-bold text-bananur-clay flex items-center gap-2">
                  <Edit className="w-5 h-5 text-bananur-gold-dark" />
                  Modificar Publicación
                </h3>
                <p className="text-[10px] text-bananur-clay-light font-mono font-medium">Estás editando un elemento del Catálogo Web.</p>
              </div>
              <button onClick={() => setEditingItemType(null)} className="text-bananur-clay hover:text-bananur-gold p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditItem} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {editingItemType === 'producto' && (
                <div className="space-y-4 animate-fade-in text-xs font-sans text-bananur-clay">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Nombre de Objeto</label>
                      <input
                        id="edit-prod-name"
                        type="text"
                        required
                        value={editProdName}
                        onChange={(e) => setEditProdName(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30 font-semibold text-bananur-clay"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Categoría Boutique</label>
                       <select
                        id="edit-prod-cat"
                        value={editProdCategory}
                        onChange={(e) => setEditProdCategory(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-white text-bananur-clay font-bold cursor-pointer"
                      >
                        {productCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* ROPA SPECIALIZED SUB-CATEGORY SELECTOR IN EDIT */}
                  {editProdCategory.toLowerCase() === 'ropa' && (
                    <div className="bg-bananur-cream/80 border border-bananur-sand rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay flex items-center gap-1.5">
                          <Shirt className="w-3.5 h-3.5 text-bananur-gold-dark" />
                          Subcategoría Textil
                        </label>
                        <span className="text-[10px] font-mono text-bananur-clay-light">Selecciona el tipo de prenda</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          id="edit-btn-clothing-new"
                          onClick={() => setEditClothingType('nueva')}
                          className={`p-2.5 rounded-lg border text-left flex flex-col gap-0.5 cursor-pointer transition-all ${
                            editClothingType === 'nueva'
                              ? 'bg-white border-emerald-500 text-emerald-900 shadow-xs ring-1 ring-emerald-400/50'
                              : 'bg-white/60 border-bananur-sand text-bananur-clay-light hover:bg-white'
                          }`}
                        >
                          <span className="font-bold text-xs flex items-center gap-1">
                            ✨ Ropa Nueva
                          </span>
                          <span className="text-[10px] opacity-80">Prenda nueva estándar con precio fijo</span>
                        </button>

                        <button
                          type="button"
                          id="edit-btn-clothing-vintage"
                          onClick={() => {
                            setEditClothingType('vintage');
                            const weight = Number(editProdWeightGrams) || 350;
                            const rate = Number(editProdPricePerKg) || 24000;
                            setEditProdPrice(String(Math.round((weight / 1000) * rate)));
                          }}
                          className={`p-2.5 rounded-lg border text-left flex flex-col gap-0.5 cursor-pointer transition-all ${
                            editClothingType === 'vintage'
                              ? 'bg-amber-50/90 border-amber-500 text-amber-950 shadow-xs ring-1 ring-amber-400/50'
                              : 'bg-white/60 border-bananur-sand text-bananur-clay-light hover:bg-white'
                          }`}
                        >
                          <span className="font-bold text-xs flex items-center gap-1">
                            <Scale className="w-3.5 h-3.5 text-amber-700" /> Ropa Vintage (Por Peso)
                          </span>
                          <span className="text-[10px] opacity-80">Calcular precio según gramaje / kg</span>
                        </button>
                      </div>

                      {/* VINTAGE WEIGHT & LOT CALCULATOR PANEL IN EDIT */}
                      {editClothingType === 'vintage' && (
                        <div className="mt-2 bg-amber-100/60 border border-amber-300 rounded-xl p-3.5 space-y-3 shadow-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs font-mono">
                              <Calculator className="w-3.5 h-3.5 text-amber-800" />
                              Calculadora por Gramaje & Identificación de Fardo
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditShowNewLotForm(!editShowNewLotForm)}
                              className="text-[10px] font-mono font-bold text-amber-900 hover:text-amber-950 bg-amber-200/90 hover:bg-amber-300 px-2 py-0.5 rounded-md border border-amber-400/80 flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              {editShowNewLotForm ? 'Cerrar Registro' : '+ Registrar Nuevo Fardo'}
                            </button>
                          </div>

                          {/* INLINE NEW LOT CREATION FORM (EDIT) */}
                          {editShowNewLotForm && (
                            <div className="bg-white border border-amber-400 rounded-lg p-3 space-y-2.5 shadow-xs">
                              <div className="flex items-center justify-between border-b border-amber-200 pb-1.5">
                                <span className="text-[11px] font-mono font-bold text-amber-950 flex items-center gap-1">
                                  <Package className="w-3.5 h-3.5 text-amber-700" /> Alta de Nuevo Lote / Fardo Textil
                                </span>
                                <span className="text-[10px] font-mono text-amber-700">Se asignará automáticamente</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                <div>
                                  <label className="block text-[10px] font-mono font-bold text-amber-950 mb-0.5">
                                    Código de Fardo (ej. FRD-2024-05) *
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="FRD-2024-05"
                                    value={createLotCode}
                                    onChange={(e) => setCreateLotCode(e.target.value.toUpperCase())}
                                    className="w-full p-1.5 bg-amber-50/50 border border-amber-300 rounded font-mono font-bold text-xs text-amber-950"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-mono font-bold text-amber-950 mb-0.5">
                                    Nombre o Descripción del Fardo *
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Fardo Trench & Abrigos Lana"
                                    value={createLotName}
                                    onChange={(e) => setCreateLotName(e.target.value)}
                                    className="w-full p-1.5 bg-amber-50/50 border border-amber-300 rounded text-xs text-amber-950"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-mono font-bold text-amber-950 mb-0.5">
                                    Precio Total del Fardo ($ CLP) *
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    placeholder="1260000"
                                    value={createLotTotalPrice}
                                    onChange={(e) => setCreateLotTotalPrice(e.target.value)}
                                    className="w-full p-1.5 bg-amber-50/50 border border-amber-300 rounded font-mono font-bold text-xs text-amber-950"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-mono font-bold text-amber-950 mb-0.5">
                                    Peso Total del Fardo (Kg) *
                                  </label>
                                  <input
                                    type="number"
                                    min="0.1"
                                    step="any"
                                    placeholder="45"
                                    value={createLotWeightKg}
                                    onChange={(e) => setCreateLotWeightKg(e.target.value)}
                                    className="w-full p-1.5 bg-amber-50/50 border border-amber-300 rounded font-mono font-bold text-xs text-amber-950"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-mono font-bold text-amber-950 mb-0.5 flex items-center justify-between">
                                    <span>Tarifa Fija por Kilo ($ CLP/kg) *</span>
                                    <span className="text-[9px] text-amber-700 font-normal">Precio ÷ Peso</span>
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    placeholder="28000"
                                    value={createLotPricePerKg}
                                    onChange={(e) => setCreateLotPricePerKg(e.target.value)}
                                    className="w-full p-1.5 bg-amber-100/70 border border-amber-400 rounded font-mono font-bold text-xs text-amber-950"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-mono font-bold text-amber-950 mb-0.5">
                                    Origen / Proveedor (Opcional)
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Importación Directa USA"
                                    value={createLotOrigin}
                                    onChange={(e) => setCreateLotOrigin(e.target.value)}
                                    className="w-full p-1.5 bg-amber-50/50 border border-amber-300 rounded text-xs text-amber-950"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-[10px] text-amber-800">
                                  💡 Gestión global disponible en Insumos y Materias Primas (MRP)
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setEditShowNewLotForm(false)}
                                    className="px-2.5 py-1 text-[11px] font-mono border border-bananur-sand rounded text-bananur-clay hover:bg-bananur-sand/30"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAddNewLot(true)}
                                    disabled={!createLotCode.trim() || !createLotName.trim()}
                                    className="px-3 py-1 text-[11px] font-mono font-bold bg-amber-600 hover:bg-amber-700 text-white rounded shadow-xs disabled:opacity-50 cursor-pointer"
                                  >
                                    Guardar y Seleccionar Fardo
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* LOT SELECTION DROPDOWN & INFO (EDIT) */}
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-mono font-bold text-amber-950 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <Boxes className="w-3.5 h-3.5 text-amber-800" />
                                Fardo / Lote de Origen de la Prenda
                              </span>
                              <span className="text-[10px] text-amber-800 font-normal">Diferencia la tarifa de cada fardo</span>
                            </label>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div className="sm:col-span-2">
                                <select
                                  id="edit-prod-lot-select"
                                  value={editProdLotId}
                                  onChange={(e) => handleSelectLot(e.target.value, true)}
                                  className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-mono font-medium text-amber-950 focus:ring-1 focus:ring-amber-500"
                                >
                                  {availableLots.map((lot) => (
                                    <option key={lot.id} value={lot.id}>
                                      📦 [{lot.code}] {lot.name} — (${lot.pricePerKg.toLocaleString('es-CL')}/kg)
                                    </option>
                                  ))}
                                  <option value="custom">⚙️ Lote Manual / Personalizado</option>
                                </select>
                              </div>

                              <div>
                                <input
                                  type="text"
                                  placeholder="Código Lote"
                                  value={editProdLotCode}
                                  onChange={(e) => setEditProdLotCode(e.target.value.toUpperCase())}
                                  className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold text-amber-950"
                                  title="Código de identificación del lote"
                                />
                              </div>
                            </div>

                            {/* ACTIVE LOT INFO CARD */}
                            {(() => {
                              const activeLot = availableLots.find(l => l.id === editProdLotId);
                              if (!activeLot) return null;
                              return (
                                <div className="bg-amber-200/40 border border-amber-300/70 rounded-lg p-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] font-mono text-amber-950">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold bg-amber-300/80 px-1.5 py-0.5 rounded text-amber-950">
                                      {activeLot.code}
                                    </span>
                                    <span className="font-medium">{activeLot.name}</span>
                                    {activeLot.origin && (
                                      <span className="text-amber-800 text-[10px]">({activeLot.origin})</span>
                                    )}
                                  </div>
                                  <div className="font-bold text-amber-900 shrink-0">
                                    Tarifa Fardo: ${activeLot.pricePerKg.toLocaleString('es-CL')}/kg
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                          {/* WEIGHT PRESETS CHIPS */}
                          <div className="space-y-1">
                            <label className="block text-[10px] font-mono font-bold text-amber-950 uppercase tracking-wider">
                              Referencia Rápida de Gramaje (Opcional):
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                { label: 'Polera', g: '200' },
                                { label: 'Camisa', g: '320' },
                                { label: 'Pantalón/Jeans', g: '650' },
                                { label: 'Polerón', g: '750' },
                                { label: 'Chaqueta', g: '950' },
                                { label: 'Abrigo', g: '1400' },
                              ].map((p) => (
                                <button
                                  key={p.label}
                                  type="button"
                                  onClick={() => {
                                    setEditProdWeightGrams(p.g);
                                    const w = Number(p.g) || 0;
                                    const r = Number(editProdPricePerKg) || 0;
                                    setEditProdPrice(String(Math.round((w / 1000) * r)));
                                  }}
                                  className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors cursor-pointer ${
                                    editProdWeightGrams === p.g
                                      ? 'bg-amber-400 text-amber-950 font-bold border-amber-500'
                                      : 'bg-white/80 text-amber-900 border-amber-300 hover:bg-amber-200'
                                  }`}
                                >
                                  {p.label} ({p.g}g)
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div>
                              <label className="block text-[11px] font-mono font-bold text-amber-950 mb-1">
                                Peso de esta prenda (Gramos) *
                              </label>
                              <div className="relative">
                                <input
                                  id="edit-prod-weight"
                                  type="number"
                                  min="0"
                                  step="any"
                                  placeholder="Ej. 350"
                                  value={editProdWeightGrams}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditProdWeightGrams(val);
                                    const w = Number(val) || 0;
                                    const r = Number(editProdPricePerKg) || 0;
                                    setEditProdPrice(String(Math.round((w / 1000) * r)));
                                  }}
                                  className="w-full p-2 bg-white border border-amber-300 rounded text-xs font-mono font-bold text-amber-950 pr-12"
                                />
                                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-amber-800 font-bold">
                                  {Number(editProdWeightGrams) > 0 ? `${(Number(editProdWeightGrams) / 1000).toFixed(2)} kg` : 'g'}
                                </span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-mono font-bold text-amber-950 mb-1">
                                Tarifa de este fardo ($ CLP/kg) *
                              </label>
                              <input
                                id="edit-prod-rate-kg"
                                type="number"
                                min="0"
                                step="any"
                                placeholder="Ej. 28000"
                                value={editProdPricePerKg}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditProdPricePerKg(val);
                                  const w = Number(editProdWeightGrams) || 0;
                                  const r = Number(val) || 0;
                                  setEditProdPrice(String(Math.round((w / 1000) * r)));
                                }}
                                className="w-full p-2 bg-white border border-amber-300 rounded text-xs font-mono font-bold text-amber-950"
                              />
                            </div>
                          </div>

                          <div className="bg-white/90 p-2.5 rounded-lg border border-amber-200 text-[11px] font-mono text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
                            <div>
                              <span className="text-amber-800 font-bold">Fórmula {editProdLotCode ? `[${editProdLotCode}]` : ''}: </span>
                              <span>{Number(editProdWeightGrams) || 0}g ({( (Number(editProdWeightGrams) || 0) / 1000 ).toFixed(3)} kg) × ${(Number(editProdPricePerKg) || 0).toLocaleString('es-CL')}/kg</span>
                            </div>
                            <div className="font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded border border-emerald-300">
                              = ${(Math.round(((Number(editProdWeightGrams) || 0) / 1000) * (Number(editProdPricePerKg) || 0))).toLocaleString('es-CL')} CLP
                            </div>
                          </div>

                          <p className="text-[10px] font-mono text-amber-800/90">
                            * Cada prenda vintage tiene un peso propio independiente; este valor es referencial para tasar el costo de adquisición de esta unidad.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CÓDIGO ÚNICO / SKU / BARRAS */}
                  <div className="bg-amber-50/60 border border-amber-300/80 rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                        <Barcode className="w-4 h-4 text-amber-700" />
                        Código Único / SKU / Código de Barras
                      </label>
                      <button
                        type="button"
                        onClick={() => setEditProdCode(generateUniqueCode('product', editProdCategory))}
                        className="text-[10px] font-mono text-amber-900 hover:text-amber-950 flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded border border-amber-300 font-semibold"
                        title="Generar nuevo código"
                      >
                        <RefreshCw className="w-3 h-3" /> Auto-generar
                      </button>
                    </div>
                    <input
                      id="edit-prod-code"
                      type="text"
                      required
                      value={editProdCode}
                      onChange={(e) => setEditProdCode(e.target.value.toUpperCase())}
                      className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold text-amber-950 tracking-wider uppercase"
                    />
                    <p className="text-[10px] font-mono text-amber-800/80">
                      Permite escanear el objeto con la pistola lectora para añadirlo de inmediato a ventas y actualizar stock.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">
                        {editProdCategory.toLowerCase() === 'ropa' && editClothingType === 'vintage' ? 'Precio Final Calculado CLP ($)' : 'Precio CLP ($)'}
                      </label>
                      <input
                        id="edit-prod-price"
                        type="number"
                        min="1"
                        required
                        value={editProdPrice}
                        onChange={(e) => setEditProdPrice(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30 font-mono font-bold text-bananur-clay"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Unidades en Stock</label>
                      <input
                        id="edit-prod-stock"
                        type="number"
                        min="0"
                        required
                        value={editProdStock}
                        onChange={(e) => setEditProdStock(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">URL de Imagen</label>
                    <input
                      id="edit-prod-img"
                      type="text"
                      required
                      value={editProdImage}
                      onChange={(e) => setEditProdImage(e.target.value)}
                      className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30 font-mono text-[10px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Descripción de Origen</label>
                    <textarea
                      id="edit-prod-desc"
                      rows={3}
                      value={editProdDesc}
                      onChange={(e) => setEditProdDesc(e.target.value)}
                      className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30 font-light"
                    />
                  </div>
                </div>
              )}

              {editingItemType === 'servicio' && (
                <div className="space-y-4 animate-fade-in text-xs text-bananur-clay">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Nombre del Servicio</label>
                      <input
                        id="edit-serv-name"
                        type="text"
                        required
                        value={editServName}
                        onChange={(e) => setEditServName(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30 font-semibold text-bananur-clay"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Categoría Técnica</label>
                      <select
                        id="edit-serv-cat"
                        value={editServCategory}
                        onChange={(e) => setEditServCategory(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-white text-bananur-clay font-bold cursor-pointer"
                      >
                        {serviceCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* CÓDIGO ÚNICO DE SERVICIO */}
                  <div className="bg-amber-50/60 border border-amber-300/80 rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                        <Barcode className="w-4 h-4 text-amber-700" />
                        Código Único de Servicio
                      </label>
                      <button
                        type="button"
                        onClick={() => setEditServCode(generateUniqueCode('service', editServCategory))}
                        className="text-[10px] font-mono text-amber-900 hover:text-amber-950 flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded border border-amber-300 font-semibold"
                        title="Generar nuevo código"
                      >
                        <RefreshCw className="w-3 h-3" /> Auto-generar
                      </button>
                    </div>
                    <input
                      id="edit-serv-code"
                      type="text"
                      required
                      value={editServCode}
                      onChange={(e) => setEditServCode(e.target.value.toUpperCase())}
                      className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold text-amber-950 tracking-wider uppercase"
                    />
                    <p className="text-[10px] font-mono text-amber-800/80">
                      Permite escanear o ingresar el servicio en el punto de venta directo.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Precio Desde/Neto ($ CLP)</label>
                      <input
                        id="edit-serv-price"
                        type="number"
                        min="1"
                        required
                        value={editServPrice}
                        onChange={(e) => setEditServPrice(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30 font-mono text-bananur-clay"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Icono Asociado (Lucide)</label>
                      <select
                        id="edit-serv-icon"
                        value={editServIcon}
                        onChange={(e) => setEditServIcon(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-white text-bananur-clay font-bold cursor-pointer"
                      >
                        <option value="Sparkles">Destellos (Sparkles)</option>
                        <option value="Globe">Mundo (Globe)</option>
                        <option value="Layers">Capas (Layers)</option>
                        <option value="BookOpen">Libro Abierto (BookOpen)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Características / Entregables (Comas)</label>
                    <input
                      id="edit-serv-details"
                      type="text"
                      value={editServDetails}
                      onChange={(e) => setEditServDetails(e.target.value)}
                      className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Descripción Técnica</label>
                    <textarea
                      id="edit-serv-desc"
                      rows={3}
                      value={editServDesc}
                      onChange={(e) => setEditServDesc(e.target.value)}
                      className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30 font-light"
                    />
                  </div>
                </div>
              )}

              {editingItemType === 'portafolio' && (
                <div className="space-y-4 animate-fade-in text-xs text-bananur-clay">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Nombre del Proyecto</label>
                      <input
                        id="edit-port-name"
                        type="text"
                        required
                        value={editPortName}
                        onChange={(e) => setEditPortName(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30 font-semibold text-bananur-clay"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Cliente / Marca</label>
                      <input
                        id="edit-port-client"
                        type="text"
                        required
                        value={editPortClient}
                        onChange={(e) => setEditPortClient(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Área de Portafolio</label>
                      <select
                        id="edit-port-cat"
                        value={editPortCategory}
                        onChange={(e) => setEditPortCategory(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-white text-bananur-clay font-bold cursor-pointer"
                      >
                        {portfolioCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Herramientas/Stack (Comas)</label>
                      <input
                        id="edit-port-stack"
                        type="text"
                        value={editPortStack}
                        onChange={(e) => setEditPortStack(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">URL de Showcase Imagen</label>
                    <input
                      id="edit-port-image"
                      type="text"
                      required
                      value={editPortImage}
                      onChange={(e) => setEditPortImage(e.target.value)}
                      className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30 text-[10px] font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Problema del Cliente</label>
                      <textarea
                        id="edit-port-prob"
                        rows={2}
                        value={editPortProblem}
                        onChange={(e) => setEditPortProblem(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Nuestra Solución</label>
                      <textarea
                        id="edit-port-sol"
                        rows={2}
                        value={editPortSolution}
                        onChange={(e) => setEditPortSolution(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Resultado Concreto</label>
                      <input
                        id="edit-port-result"
                        type="text"
                        value={editPortResult}
                        onChange={(e) => setEditPortResult(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay-light mb-1.5">Resumen de Portada</label>
                      <input
                        id="edit-port-desc"
                        type="text"
                        value={editPortDesc}
                        onChange={(e) => setEditPortDesc(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl text-xs bg-bananur-cream/30"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-bananur-sand shrink-0">
                <button
                  id="edit-panel-btn-cancel"
                  type="button"
                  onClick={() => setEditingItemType(null)}
                  className="px-4 py-2.5 rounded-lg border border-bananur-sand text-xs text-bananur-clay font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="edit-panel-btn-submit"
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-bananur-clay text-bananur-cream text-xs font-bold hover:bg-bananur-gold hover:text-bananur-clay cursor-pointer shadow-inner"
                >
                  Guardar Cambios
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* CONFIRMACIÓN DESTRUCTIVA MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-bananur-clay/70 backdrop-blur-sm" onClick={() => setShowDeleteModal(null)}></div>
          <div className="relative bg-white max-w-sm w-full rounded-2xl shadow-xl overflow-hidden z-10 p-6 border border-rose-100 text-center space-y-5 animate-scale-up">
            
            <div className="w-12 h-12 bg-rose-50 border border-rose-200 text-bananur-coral rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-1.5 animate-pulse">
              <h3 className="font-serif text-lg font-bold text-bananur-clay">
                ¿Confirmas la eliminación?
              </h3>
              <p className="text-xs text-bananur-clay-light/90 leading-relaxed font-light">
                Esta acción dará de baja el producto <span className="font-mono text-bananur-coral font-bold">{showDeleteModal}</span> de todo el catálogo público y vaciará el stock actual. Es irreversible.
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                id="del-btn-cancel"
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 bg-bananur-sand border border-bananur-sand rounded-lg text-xs font-bold text-bananur-clay cursor-pointer"
              >
                No, cancelar
              </button>
              <button
                id="del-btn-confirm"
                onClick={() => {
                  onDeleteProduct(showDeleteModal);
                  setShowDeleteModal(null);
                }}
                className="px-5 py-2 bg-bananur-coral text-white rounded-lg text-xs font-bold hover:bg-rose-700 cursor-pointer"
              >
                Sí, eliminar producto
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
