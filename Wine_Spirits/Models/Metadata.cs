    using System.ComponentModel.DataAnnotations;

    namespace Wine_Spirits.Models;

    // --- UNIT METADATA ---
    public class UnitMetadata
    {
        [Display(Name = "Birim Adı")]
        [Required(ErrorMessage = "Birim adı zorunludur.")]
        [StringLength(50, ErrorMessage = "Birim adı en fazla 50 karakter olabilir.")]
        public string Name { get; set; }
    }

    // --- WAREHOUSE METADATA ---
    public class WareHouseMetadata
    {
        [Display(Name = "Depo Adı")]
        [Required(ErrorMessage = "Depo adı alanı boş bırakılamaz.")]
        [StringLength(100, ErrorMessage = "Depo adı en fazla 100 karakter olabilir.")]
        public string Name { get; set; }

        [Display(Name = "Konum / Adres")]
        [Required(ErrorMessage = "Depo konumu gereklidir.")]
        [DataType(DataType.MultilineText)]
        public string Location { get; set; }
    }