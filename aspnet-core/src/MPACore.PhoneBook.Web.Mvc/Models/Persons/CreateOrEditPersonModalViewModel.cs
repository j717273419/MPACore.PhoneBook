using Abp.AutoMapper;
using MPACore.PhoneBook.PhoneBooks.Dtos;

namespace MPACore.PhoneBook.Web.Models.Persons
{
    [AutoMapFrom(typeof(GetPersonForEditOutput))]
    public class CreateOrEditPersonModalViewModel:GetPersonForEditOutput
    {
        public CreateOrEditPersonModalViewModel(GetPersonForEditOutput output )
        {

            output.MapTo(this);
        }

        /// <summary>
        /// 是否为编辑模式
        /// </summary>
        public bool IsEditMode
        {
            get { return Person.Id.HasValue; }
        }

    }
}