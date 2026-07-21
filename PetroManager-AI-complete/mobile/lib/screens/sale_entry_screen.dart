import 'package:flutter/material.dart';
import '../services/sales_service.dart';
import '../services/api_client.dart';

class SaleEntryScreen extends StatefulWidget {
  const SaleEntryScreen({super.key});

  @override
  State<SaleEntryScreen> createState() => _SaleEntryScreenState();
}

class _SaleEntryScreenState extends State<SaleEntryScreen> {
  final _formKey = GlobalKey<FormState>();
  final _shiftIdController = TextEditingController();
  final _tankIdController = TextEditingController();
  final _quantityController = TextEditingController();
  final _unitPriceController = TextEditingController();
  final _descriptionController = TextEditingController();

  final _salesService = SalesService();
  bool _loading = false;
  String? _error;
  String? _success;

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _error = null;
      _success = null;
    });
    try {
      await _salesService.createSale(
        shiftId: _shiftIdController.text.trim(),
        tankId: _tankIdController.text.trim().isEmpty ? null : _tankIdController.text.trim(),
        quantity: _quantityController.text.trim().isEmpty
            ? null
            : double.tryParse(_quantityController.text.trim()),
        unitPrice: double.parse(_unitPriceController.text.trim()),
        description: _descriptionController.text.trim().isEmpty
            ? null
            : _descriptionController.text.trim(),
      );
      setState(() => _success = 'فروش با موفقیت ثبت شد');
      _quantityController.clear();
      _unitPriceController.clear();
      _descriptionController.clear();
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (e) {
      setState(() => _error = 'خطای غیرمنتظره رخ داد');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('ثبت فروش')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                controller: _shiftIdController,
                textDirection: TextDirection.ltr,
                decoration: const InputDecoration(labelText: 'شناسه شیفت (Shift ID)', border: OutlineInputBorder()),
                validator: (v) => (v == null || v.isEmpty) ? 'الزامی است' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _tankIdController,
                textDirection: TextDirection.ltr,
                decoration: const InputDecoration(
                  labelText: 'شناسه مخزن (اختیاری — برای فروش سوخت)',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _quantityController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'مقدار (لیتر)', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _unitPriceController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'قیمت واحد / مبلغ کل', border: OutlineInputBorder()),
                validator: (v) => (v == null || v.isEmpty) ? 'الزامی است' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _descriptionController,
                decoration: const InputDecoration(labelText: 'توضیحات (اختیاری)', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 20),
              if (_error != null) Text(_error!, style: const TextStyle(color: Colors.red)),
              if (_success != null) Text(_success!, style: const TextStyle(color: Colors.green)),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _loading ? null : _submit,
                  child: _loading
                      ? const SizedBox(
                          height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Text('ثبت فروش'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
